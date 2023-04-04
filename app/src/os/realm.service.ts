import RealmProcess from '../background/realm.process';
import { app } from 'electron';
import log from 'electron-log';
import AbstractService, {
  ServiceOptions,
} from './services-new/abstract.service';
import { AuthService } from './services-new/auth/auth.service';
import { ShipService } from './services-new/ship/ship.service';
import { AccountModelType } from 'renderer/stores/models/account.model';
import { getReleaseChannel, setReleaseChannel } from './lib/settings';
import APIConnection from './services-new/conduit';

export type RealmUpdateBooted = {
  type: 'booted';
  payload: {
    accounts: AccountModelType[];
    screen: 'login' | 'onboarding' | 'os';
    session?: {
      url: string;
      patp: string;
      cookie: string;
    };
  };
};

export type RealmUpdateAuthenticated = {
  type: 'authenticated';
  payload: {
    url: string;
    patp: string;
    cookie: string;
  };
};

export type RealmUpdateTypes = RealmUpdateAuthenticated | RealmUpdateBooted;

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

    const session = this._hydrateSessionIfExists();
    if (session)
      this._sendAuthenticated(session.patp, session.url, session.cookie);
    app.on('quit', () => {
      // do other cleanup here
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
    // example: INSTALL_MOON=~hostyv:realm,courier
    if (process.env.INSTALL_MOON && process.env.INSTALL_MOON !== 'bypass') {
      const parts: string[] = process.env.INSTALL_MOON.split(':');
      ship = parts[0];
      desks = parts[1].split(',');
    } else {
      ship = channel === 'latest' ? '~hostyv' : '~nimwyd-ramwyl-dozzod-hostyv';
      desks = ['realm', 'courier'];
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
