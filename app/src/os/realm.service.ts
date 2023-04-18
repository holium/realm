import {
  app,
  BrowserWindow,
  session,
  WebContents,
  WebPreferences,
} from 'electron';
import log from 'electron-log';
import bcrypt from 'bcryptjs';
import AbstractService, { ServiceOptions } from './services/abstract.service';
import { AuthService } from './services/auth/auth.service';
import { ShipService } from './services/ship/ship.service';
import { getReleaseChannel, setReleaseChannel } from './lib/settings';
import { getCookie } from './lib/shipHelpers';
import APIConnection from './services/conduit';
import { MasterAccount } from './services/auth/masterAccounts.table';
import { Account } from './services/auth/accounts.table';

type CreateAccountPayload = Omit<
  Account,
  'passwordHash' | 'updatedAt' | 'createdAt'
> & {
  password: string;
};

export class RealmService extends AbstractService {
  // private realmProcess: RealmProcess | null = null;
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
    const session = this._hydrateSessionIfExists();
    if (session)
      this._sendAuthenticated(session.patp, session.url, session.cookie);
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
      session = this._hydrateSessionIfExists();
      this.services?.ship?.init();
    }

    this.sendUpdate({
      type: 'booted',
      payload: {
        screen: hasSession ? 'os' : 'login',
        accounts: this.services?.auth.getAccounts(),
        session,
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
      return {
        patp,
        url: credentials.url,
        cookie: credentials.cookie,
      };
    }
    return null;
  }

  public async createAccount({ password, ...rest }: CreateAccountPayload) {
    if (!this.services) return Promise.resolve(false);

    return this.services.auth.createAccount({
      ...rest,
      passwordHash: bcrypt.hashSync(password, 10),
    });
  }

  public async createMasterAccount(payload: Omit<MasterAccount, 'id'>) {
    if (!this.services) return;

    return this.services.auth.createMasterAccount(payload);
  }

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
        type: 'login-failed',
        payload: `${patp} failed to authenticate`,
      });
      return false;
    }
    if (isAuthenticated) {
      // TODO Add amplitude logging here
      log.info(`${patp} authenticated`);
      const key = await this.services.auth.deriveDbKey(password);
      this.services.ship = new ShipService(patp, key);
      const credentials = this.services.ship.credentials;
      this.services.auth._setSession(patp, key);
      this._sendAuthenticated(patp, credentials.url, credentials.cookie);
    }
    return isAuthenticated;
  }

  async logout(patp: string) {
    if (!this.services) {
      return;
    }
    this.services.ship?.cleanup();
    delete this.services.ship;
    this.services.auth._clearSession();
    this.sendUpdate({
      type: 'logout',
      payload: patp,
    });
  }

  private _sendAuthenticated(patp: string, url: string, cookie: string) {
    this.sendUpdate({
      type: 'authenticated',
      payload: {
        patp,
        url,
        cookie,
      },
    });
  }

  async getReleaseChannel(): Promise<string> {
    return getReleaseChannel();
  }

  setReleaseChannel(channel: string) {
    let ship = undefined;
    let desks = undefined;
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
    setReleaseChannel(channel);
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
        const hasSession = this.services?.ship?.credentials;
        const { url, ship, code } = this.services?.ship?.credentials;
        if (!hasSession) {
          log.error('unable to redirect. invalid session');
          return;
        }
        if (!url || !ship || !code) {
          log.error('no credentials');
          return;
        }
        log.info(
          'child window attempting to redirect to login. refreshing cookie...'
        );
        const cookie = await getCookie({
          patp: ship,
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
          name: `urbauth-${ship}`,
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

type RealmServicePublicMethods = Pick<
  RealmService,
  | 'boot'
  | 'login'
  | 'logout'
  | 'createAccount'
  | 'createMasterAccount'
  | 'getReleaseChannel'
  | 'setReleaseChannel'
> & {
  onUpdate: (...args: any[]) => void;
};

// Generate preload
export const realmPreload = RealmService.preload(
  new RealmService({ preload: true })
) as RealmServicePublicMethods;
