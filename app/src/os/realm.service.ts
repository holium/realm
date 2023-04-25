import {
  app,
  BrowserWindow,
  session,
  WebContents,
  WebPreferences,
} from 'electron';
import log from 'electron-log';
import { track } from '@amplitude/analytics-browser';

import {
  getReleaseChannelFromSettings,
  saveReleaseChannelInSettings,
} from './lib/settings';
import { getCookie } from './lib/shipHelpers';
import AbstractService, { ServiceOptions } from './services/abstract.service';
import { APIConnection } from './services/api';
import { AuthService } from './services/auth/auth.service';
import OnboardingService from './services/auth/onboarding.service';
import { FileUploadParams, ShipService } from './services/ship/ship.service';
import { RealmUpdateTypes } from './realm.types';

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

    app.on('quit', () => {
      // do other cleanup here
    });

    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.on('did-attach-webview', this.onWebViewAttached);
      window.webContents.on(
        'will-attach-webview',
        (_event: Electron.Event, webPreferences: WebPreferences) => {
          webPreferences.partition = 'urbit-webview';
        }
      );
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
      session = await this._hydrateSessionIfExists();
      this.services?.ship?.init();
    }

    this.sendUpdate({
      type: 'booted',
      payload: {
        accounts: this.services?.auth.getAccounts() || undefined,
        session,
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

      return new Promise((resolve) => {
        APIConnection.getInstance().conduit.on('connected', () => {
          if (!this.services) return;
          this.services.auth._setLockfile({ ...credentials, ship: patp });
          this.services.ship?.init();
          this._sendAuthenticated(patp, credentials.url, credentials.cookie);
          resolve(true);
        });
      });
    }
    return isAuthenticated;
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
  async logout(patp: string) {
    if (!this.services) {
      return;
    }

    this.services.ship?.cleanup();
    APIConnection.getInstance().closeChannel();
    delete this.services.ship;
    this.services.auth._clearLockfile();
    this.sendUpdate({
      type: 'logout',
      payload: {
        patp,
      },
    });
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

  private _sendAuthenticated(patp: string, url: string, cookie: string) {
    this.sendUpdate({
      type: 'auth-success',
      payload: {
        patp,
        url,
        cookie,
      },
    });
  }

  private async _hydrateSessionIfExists(): Promise<{
    url: string;
    patp: string;
    cookie: string;
  } | null> {
    if (!this.services) return null;
    const session = this.services?.auth._getLockfile();
    if (session) {
      log.info('realm.service.ts:', 'Hydrating session from session.lock');

      const account = this.services.auth.getAccount(session.ship);
      if (!account) {
        log.error('realm.service.ts:', 'Account not found');
        this.services.auth._clearLockfile();
        return Promise.resolve(null);
      }

      // todo figure out how to get the password and encryptionKey from the lockfile
      this.services.ship = new ShipService(session.ship, '', '');

      return Promise.resolve({
        url: session.url,
        patp: session.ship,
        cookie: session.cookie,
      });
    }
    return Promise.resolve(null);
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

  // async installRealmAgent() {
  //   if (!this.services) return false;

  //   const credentials = this.services.ship?.credentials;

  //   if (!credentials) {
  //     log.error('realm.service.ts:', 'No credentials found');
  //     return false;
  //   }

  //   const patp = this.services.ship?.patp;

  //   if (!patp) {
  //     log.error('realm.service.ts:', 'No patp found');
  //     return false;
  //   }

  //   try {
  //     await APIConnection.getInstance({
  //       ...credentials,
  //       ship: patp,
  //     }).conduit.poke({
  //       app: 'hood',
  //       mark: 'kiln-install',
  //       json: {
  //         ship: '~hostyv',
  //         desk: 'realm',
  //         local: 'realm',
  //       },
  //     });
  //   } catch (e) {
  //     log.error('realm.service.ts:', 'Failed to install Realm agent');
  //     return false;
  //   }

  //   return true;
  // }

  async onWillRedirect(url: string, webContents: any) {
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
        const { url, code } = credentials;
        const patp = this.services?.ship?.patp;
        if (!patp) {
          log.error('realm.service.ts:', 'No patp found');
          return;
        }
        log.info(
          'realm.service.ts:',
          'child window attempting to redirect to login. refreshing cookie...'
        );
        const cookie = await getCookie({
          patp,
          url,
          code,
        });
        log.info(
          'realm.service.ts:',
          'new cookie generated. reloading child window and saving new cookie to session.'
        );
        if (!cookie) {
          log.error('realm.service.ts:', 'no cookie');
          return;
        }
        await session.fromPartition(`urbit-webview`).cookies.set({
          url: `${url}`,
          // url: `${url}${appPath}`,
          name: `urbauth-${patp}`,
          value: cookie?.split('=')[1].split('; ')[0],
          // value: cookie,
        });
        this.services?.ship?.updateCookie(cookie);
        webContents.reload();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onWebViewAttached(_: Event, webContents: WebContents) {
    webContents.on('will-redirect', (_e: Event, url: string) =>
      this.onWillRedirect(url, webContents)
    );
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
