import { app, BrowserWindow, WebContents } from 'electron';
import log from 'electron-log';
import { track } from '@amplitude/analytics-browser';

import { ConduitState } from 'os/services/api';

import {
  getReleaseChannelFromSettings,
  saveReleaseChannelInSettings,
} from './lib/settings';
import { getCookie, setSessionCookie } from './lib/shipHelpers';
import { RealmUpdateTypes } from './realm.types';
import AbstractService, { ServiceOptions } from './services/abstract.service';
import { APIConnection } from './services/api';
import { AuthService } from './services/auth/auth.service';
import OnboardingService from './services/auth/onboarding.service';
import { MigrationService } from './services/migration/migration.service';
import { FileUploadParams, ShipService } from './services/ship/ship.service';

export class RealmService extends AbstractService<RealmUpdateTypes> {
  public services?: {
    auth: AuthService;
    onboarding: OnboardingService;
    migration: MigrationService;
    ship?: ShipService;
  };

  constructor(options?: ServiceOptions) {
    super('realmService', options);
    if (options?.preload) return;
    this.services = {
      auth: new AuthService(),
      onboarding: new OnboardingService(),
      migration: new MigrationService(),
    };

    this.onWebViewAttached = this.onWebViewAttached.bind(this);
    this.onWillRedirect = this.onWillRedirect.bind(this);

    // app.on('quit', () => {
    //   // do other cleanup here
    // });

    // app.on(
    //   'web-contents-created',
    //   async (_: Event, webContents: WebContents) => {
    //     webContents.on('will-redirect', (e: Event, url: string) => {
    //       e.preventDefault();
    //       this.onWillRedirect(url, webContents);
    //     });
    //   }
    // );

    const windows = BrowserWindow.getAllWindows();
    windows.forEach(({ webContents }) => {
      webContents.on('did-attach-webview', (event, webviewWebContents) => {
        log.info("realm.service.ts: 'did-attach-webview' event fired");
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
    const session = await this._hydrateSessionIfExists();
    this.services?.ship?.init(this.services?.auth);

    this.sendUpdate({
      type: 'booted',
      payload: {
        accounts: this.services?.auth.getAccounts() || undefined,
        session: session
          ? {
              serverId: session.patp,
              serverUrl: session.url,
              cookie: session.cookie || '',
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
      await this.services.ship.construct();

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

      await setSessionCookie({ ...credentials, cookie });
      // return new Promise(async (resolve) => {
      // APIConnection.getInstance().conduit.once('connected', () => {
      log.info('realm.service.ts, login: conduit connected');
      if (!this.services) return isAuthenticated;
      this.services.auth._setLockfile({
        ...credentials,
        cookie,
        ship: patp,
      });
      await this.services.ship?.init(this.services.auth);
      this.services.ship?.updateCookie(cookie);
      this._sendAuthenticated(patp, credentials.url, credentials.cookie ?? '');
      //   resolve(true);
      // });
      // });
    }
    return isAuthenticated;
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
  async uploadFile(
    args: FileUploadParams
  ): Promise<{ Location: string; key: string } | undefined> {
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

  private async _hydrateSessionIfExists() {
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
      await this.services.ship.construct();

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

        // await setSessionCookie({ ...credentials, cookie });

        this.services?.ship?.updateCookie(cookie);
        log.info('realm.service.ts', 'reloading after cookie refresh');
        webContents.reload();
        // webContents.loadURL(url, {
        //   extraHeaders: `Cookie: ${cookie}`,
        // });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onWebViewAttached(_: any, webContents: WebContents) {
    webContents.on('dom-ready', () => {
      // TODO wire up libs here
    });
  }

  async reconnectConduit() {
    log.info('realm.service.ts:', 'Reconnecting conduit');
    try {
      await APIConnection.getInstance().reconnect();
      this.services?.ship?.init(this.services?.auth);
    } catch (e) {
      log.error(e);
    }
    // APIConnection.getInstance()
    //   .reconnect()
    //   .then(() => this.services?.ship?.init(this.services?.auth))
    //   .catch((e) => log.error(e));
  }

  async setConduitStatus(status: ConduitState) {
    APIConnection.getInstance().conduit.updateStatus(status);
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
