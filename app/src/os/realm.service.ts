import { app, BrowserWindow, session, WebContents } from 'electron';
import log from 'electron-log';
import { track } from '@amplitude/analytics-browser';

import {
  getReleaseChannelFromSettings,
  saveReleaseChannelInSettings,
} from './lib/settings';
import { getCookie } from './lib/shipHelpers';
import { RealmUpdateTypes } from './realm.types';
import AbstractService, { ServiceOptions } from './services/abstract.service';
import { APIConnection } from './services/api';
import { AuthService } from './services/auth/auth.service';
import OnboardingService from './services/auth/onboarding.service';
import { FileUploadParams, ShipService } from './services/ship/ship.service';
import { Credentials } from './services/ship/ship.types.ts';

const isDev = process.env.NODE_ENV === 'development';

export class RealmService extends AbstractService<RealmUpdateTypes> {
  public services?: {
    auth: AuthService;
    onboarding: OnboardingService;
    ship?: ShipService;
  };

  constructor(options?: ServiceOptions) {
    super('realmService', options);
    if (options?.preload) return;
    this.services = {
      auth: new AuthService(),
      onboarding: new OnboardingService(),
    };

    this.onWebViewAttached = this.onWebViewAttached.bind(this);
    this.onWillRedirect = this.onWillRedirect.bind(this);

    app.on('quit', () => {
      // do other cleanup here
    });

    const windows = BrowserWindow.getAllWindows();
    windows.forEach(({ webContents }) => {
      webContents.on('did-attach-webview', (event, webviewWebContents) => {
        this.onWebViewAttached(event, webviewWebContents);
      });
    });
  }

  /**
   * ------------------------------
   * boot
   * ------------------------------
   * Boot the realm service. Eventually this will start a background process
   * that will handle all realm related tasks per window.
   *
   * @returns void
   */
  public async boot() {
    let session;
    if (isDev) {
      session = this._hydrateSessionIfExists();
      this.services?.ship?.init();
    }

    this.sendUpdate({
      type: 'booted',
      payload: {
        accounts: this.services?.auth.getAccounts() || undefined,
        session: session
          ? {
              serverId: session.patp,
              serverUrl: session.url,
              cookie: session.cookie,
            }
          : undefined,
        seenSplash: this.services?.auth.hasSeenSplash() || false,
      },
    });
  }

  /**
   * ------------------------------
   * login
   * ------------------------------
   * Login to a ship, unlock the db, and start the ship service.
   *
   * @param patp
   * @param password
   * @returns
   */
  async login(patp: string, password: string): Promise<boolean> {
    if (!this.services) {
      return false;
    }

    // this.services.ship?.decryptDb(password);

    const account = this.services.auth.getAccount(patp);
    if (!account) {
      log.info('realm.service.ts:', `No account found for ${patp}`);
      return false;
    }
    const isAuthenticated = this.services.auth._verifyPassword(
      password,
      account.passwordHash
    );

    if (!isAuthenticated) {
      log.warn(`${patp} failed to authenticate`);
      this.sendUpdate({
        type: 'auth-failed',
        payload: 'password',
      });
      return false;
    }
    if (isAuthenticated) {
      track('login', { patp });
      log.info('realm.service.ts:', `${patp} authenticated`);
      const encryptionkey = await this.services.auth.deriveDbKey(password);
      if (this.services.ship) this.services.ship.cleanup();
      this.services.ship = new ShipService(patp, password, encryptionkey);

      const credentials = this.services.ship?.credentials;
      if (!credentials) {
        log.error('realm.service.ts:', 'No credentials found');
        return false;
      }
      const cookie = await getCookie({
        serverUrl: credentials.url,
        serverCode: credentials.code,
      });
      if (!cookie) {
        log.error('realm.service.ts:', 'Fetching cookie failed');
        return false;
      }

      await this.setSessionCookie({ ...credentials, cookie });
      return new Promise((resolve) => {
        APIConnection.getInstance().conduit.once('connected', () => {
          log.info('realm.service.ts, login: conduit connected');
          if (!this.services) return;
          this.services.auth._setLockfile({ ...credentials, ship: patp });
          this.services.ship?.init();
          this.services.ship?.updateCookie(cookie);
          this._sendAuthenticated(patp, credentials.url, credentials.cookie);
          resolve(true);
        });
      });
    }
    return isAuthenticated;
  }

  async setSessionCookie(credentials: Credentials) {
    const path = credentials.cookie?.split('; ')[1].split('=')[1];
    const maxAge = credentials.cookie?.split('; ')[2].split('=')[1];
    const value = credentials.cookie?.split('=')[1].split('; ')[0];
    // remove current cookie
    await session
      .fromPartition(`persist:default-${credentials.ship}`)
      .cookies.remove(`${credentials.url}`, `urbauth-${credentials.ship}`);
    // set new cookie
    await session
      .fromPartition(`persist:default-${credentials.ship}`)
      .cookies.set({
        url: `${credentials.url}`,
        name: `urbauth-${credentials.ship}`,
        value,
        expirationDate:
          new Date(Date.now() + parseInt(maxAge) * 1000).getTime() / 1000,
        path: path,
      });
  }

  /**
   * ------------------------------
   * shutdown
   * ------------------------------
   * Shutdown of realm, logout the ship and quit.
   *
   * @param patp
   * @returns
   */
  async shutdown(patp: string) {
    if (await this.logout(patp)) {
      app.quit();
    } else {
      console.warn('somehow we failed to logout while trying to shutdown');
    }
  }

  /**
   * ------------------------------
   * logout
   * ------------------------------
   * Logout of a ship, clear the db, and stop the ship service.
   *
   * @param patp
   * @returns
   */
  async logout(serverId: string) {
    if (!this.services) {
      return false;
    }
    await this.services.ship?.cleanup();
    delete this.services.ship;
    this.services.auth._clearLockfile();
    this.sendUpdate({
      type: 'logout',
      payload: {
        serverId,
      },
    });
    return true;
  }

  // Used in onboarding before a session exists.
  async uploadFile(args: FileUploadParams): Promise<string | undefined> {
    if (!this.services) return;

    const credentials = this.services.ship?.credentials;

    if (!credentials) {
      log.error('realm.service.ts:', 'No credentials found');
      return;
    }

    const patp = this.services.ship?.patp;

    if (!patp) {
      log.error('realm.service.ts:', 'No patp found');
      return;
    }

    return this.services.ship?.uploadFile(args);
  }

  async updatePassword(patp: string, password: string) {
    if (!this.services) return;

    return this.services.auth.updatePassword(patp, password);
  }

  private _sendAuthenticated(
    serverId: string,
    serverUrl: string,
    cookie: string
  ) {
    this.sendUpdate({
      type: 'auth-success',
      payload: {
        serverId,
        serverUrl,
        cookie,
      },
    });
  }

  private _hydrateSessionIfExists() {
    if (!this.services) return null;

    const session = this.services?.auth._getLockfile();

    if (session) {
      log.info('realm.service.ts:', 'Hydrating session from session.lock');

      const account = this.services.auth.getAccount(session.ship);
      if (!account) {
        log.error('realm.service.ts:', 'Account not found');
        this.services.auth._clearLockfile();
        return null;
      }

      // todo figure out how to get the password and encryptionKey from the lockfile
      this.services.ship = new ShipService(session.ship, '', '');

      return {
        url: session.url,
        patp: session.ship,
        cookie: session.cookie,
      };
    }

    return null;
  }

  getReleaseChannel() {
    return getReleaseChannelFromSettings();
  }

  setReleaseChannel(channel: string) {
    let ship;
    let desks;

    // INSTALL_MOON is a string of format <moon>:<desk>,<desk>,<desk>,...
    // example: INSTALL_MOON=~hostyv:realm
    if (process.env.INSTALL_MOON && process.env.INSTALL_MOON !== 'bypass') {
      const parts: string[] = process.env.INSTALL_MOON.split(':');
      ship = parts[0];
      desks = parts[1].split(',');
    } else {
      ship = channel === 'latest' ? '~hostyv' : '~nimwyd-ramwyl-dozzod-hostyv';
      desks = ['realm'];
    }
    for (let i = 0; i < desks.length; i++) {
      const desk = desks[i];
      APIConnection.getInstance().conduit.poke({
        app: 'hood',
        mark: 'kiln-install',
        json: {
          ship: ship,
          desk: desk,
          local: desk,
        },
        onError: (e: any) => {
          console.error(e);
        },
      });
    }
    saveReleaseChannelInSettings(channel);
  }

  async onWillRedirect(url: string, webContents: WebContents) {
    try {
      const delim = '/~/login?redirect=';
      const parts = url.split(delim);
      // http://localhost/~/login?redirect=
      if (parts.length > 1) {
        let appPath = decodeURIComponent(parts[1]);
        // console.log('appPath => %o', appPath);
        appPath = appPath.split('?')[0];
        if (appPath.endsWith('/')) {
          appPath = appPath.substring(0, appPath.length - 1);
        }
        const credentials = this.services?.ship?.credentials;
        if (!credentials) {
          log.error('realm.service.ts:', 'No credentials found');
          return;
        }
        const cookie = await getCookie({
          serverUrl: credentials.url,
          serverCode: credentials.code,
        });
        log.info('realm.service.ts:', 'onWillRedirect getCookie', cookie);
        if (!cookie) {
          log.error('realm.service.ts:', 'Could not fetch a new cookie!');
          // TODO show feedback to user
          return;
        }
        const patp = this.services?.ship?.patp;
        if (!patp) {
          log.error('realm.service.ts:', 'No patp found');
          return;
        }

        log.info('realm.service.ts:', 'Setting cookie', cookie);
        await this.setSessionCookie({ ...credentials, cookie });

        this.services?.ship?.updateCookie(cookie);
        webContents.reload();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onWebViewAttached(_: any, webContents: WebContents) {
    webContents.on('will-redirect', (_, url) => {
      this.onWillRedirect(url, webContents);
    });

    webContents.on('dom-ready', () => {
      // TODO wire up libs here
    });
  }
  // private startBackgroundProcess(): void {
  //   if (this.realmProcess) {
  //     return;
  //   }

  //   this.realmProcess = new RealmProcess();
  //   this.realmProcess.start();
  // }
}

// Generate preload
export const realmPreload = RealmService.preload(
  new RealmService({ preload: true })
);
