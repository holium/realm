import {
  app,
  BrowserWindow,
  session,
  WebContents,
  WebPreferences,
} from 'electron';
import log from 'electron-log';
import { track } from '@amplitude/analytics-browser';
import AbstractService, { ServiceOptions } from './services/abstract.service';
import { AuthService } from './services/auth/auth.service';
import { ShipService } from './services/ship/ship.service';
import {
  getReleaseChannelFromSettings,
  saveReleaseChannelInSettings,
} from './lib/settings';
import { getCookie } from './lib/shipHelpers';
import { APIConnection } from './services/api';
import { MasterAccount } from './services/auth/masterAccounts.table';
import { Account } from './services/auth/accounts.table';
import { RealmUpdateTypes } from './realm.types';

type CreateAccountPayload = Omit<
  Account,
  'passwordHash' | 'updatedAt' | 'createdAt'
> & {
  password: string;
};

type CreateMasterAccountPayload = Omit<MasterAccount, 'id' | 'passwordHash'> & {
  password: string;
};

export class RealmService extends AbstractService<RealmUpdateTypes> {
  public services?: {
    auth: AuthService;
    ship?: ShipService;
  };

  constructor(options?: ServiceOptions) {
    super('realmService', options);
    if (options?.preload) return;
    this.services = {
      auth: new AuthService(),
    };

    this.onWebViewAttached = this.onWebViewAttached.bind(this);
    // const session = this._hydrateSessionIfExists();
    // if (session)
    //   this._sendAuthenticated(session.patp, session.url, session.cookie);
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
  public boot() {
    const hasSession = this.services?.auth.session;
    let session;
    if (hasSession) {
      // session = this._hydrateSessionIfExists();
      // this.services?.ship?.init();
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

    const account = this.services.auth.getAccount(patp);
    if (!account) {
      log.info(`No account found for ${patp}`);
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
      log.info(`${patp} authenticated`);
      const key = await this.services.auth.deriveDbKey(password);
      if (this.services.ship) this.services.ship.cleanup();
      this.services.ship = new ShipService(patp, key);
      const credentials = this.services.ship.credentials;
      if (!credentials) {
        log.error('No credentials found');
        return false;
      }

      return new Promise((resolve) => {
        APIConnection.getInstance().conduit.on('connected', () => {
          if (!this.services) return;
          // this.services.auth._setSession(patp, key);
          this.services.ship?.init();
          this._sendAuthenticated(patp, credentials.url, credentials.cookie);
          resolve(true);
        });
      });
    }
    return isAuthenticated;
  }

  async logout(patp: string) {
    if (!this.services) {
      return;
    }
    this.services.ship?.cleanup();
    APIConnection.getInstance().closeChannel();
    delete this.services.ship;
    this.services.auth._clearSession();
    this.sendUpdate({
      type: 'logout',
      payload: {
        patp,
      },
    });
  }

  async updatePassport(
    patp: string,
    nickname: string,
    description: string,
    avatar: string
  ) {
    if (!this.services) return;

    return this.services.auth.updatePassport(
      patp,
      nickname,
      description,
      avatar
    );
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

  private _hydrateSessionIfExists(): {
    patp: string;
    url: string;
    cookie: string;
  } | null {
    if (this.services?.auth.session) {
      const { patp, key } = this.services.auth.session;
      if (!this.services.ship) {
        this.services.ship = new ShipService(patp, key);
      }
      const credentials = this.services.ship.credentials;
      if (!credentials) {
        log.error('No credentials found');
        return null;
      }

      return {
        patp,
        url: credentials.url,
        cookie: credentials.cookie,
      };
    }
    return null;
  }

  public createAccount(accountPayload: CreateAccountPayload, shipCode: string) {
    if (!this.services) return false;

    const { account, shipDB } = this.services.auth.createAccount(
      accountPayload,
      shipCode
    );

    if (!account) {
      log.error('Failed to create account');
      return false;
    }

    if (!shipDB) {
      log.error('Failed to create shipDB');
      return false;
    }

    log.info(`Created account for ${account.patp}`);

    if (!this.services.ship) {
      this.services.ship = new ShipService(
        account.patp,
        accountPayload.password
      );
    }

    return account;
  }

  public async createMasterAccount(payload: CreateMasterAccountPayload) {
    if (!this.services) return;

    return this.services.auth.createMasterAccount(payload);
  }

  public async getCookie(patp: string, url: string, code: string) {
    const cookie = await getCookie({ patp, url, code });
    if (!cookie) throw new Error('Failed to get cookie');
    const cookiePatp = cookie.split('=')[0].replace('urbauth-', '');
    const sanitizedCookie = cookie.split('; ')[0];

    if (patp.toLowerCase() !== cookiePatp.toLowerCase()) {
      throw new Error('Invalid code.');
    }

    return sanitizedCookie;
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

  async installRealmAgent() {
    if (!this.services) return false;

    const credentials = this.services.ship?.credentials;

    if (!credentials) {
      log.error('No credentials found');
      return false;
    }

    const patp = this.services.ship?.patp;

    if (!patp) {
      log.error('No patp found');
      return false;
    }

    await APIConnection.getInstance({
      ...credentials,
      ship: patp,
    }).conduit.poke({
      app: 'hood',
      mark: 'kiln-install',
      json: {
        ship: '~hostyv',
        desk: 'realm',
        local: 'realm',
      },
      onError: (e: any) => {
        console.error(e);
      },
    });

    return true;
  }

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
          log.error('No credentials found');
          return;
        }
        const { url, code } = credentials;
        const patp = this.services?.auth?.session?.patp;
        if (!patp) {
          log.error('No patp found');
          return;
        }
        log.info(
          'child window attempting to redirect to login. refreshing cookie...'
        );
        const cookie = await getCookie({
          patp,
          url,
          code,
        });
        log.info(
          'new cookie generated. reloading child window and saving new cookie to session.'
        );
        if (!cookie) {
          log.error('no cookie');
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
