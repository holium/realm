import log from 'electron-log';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Store from 'electron-store';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { AuthDB } from './auth.db';
import { Account } from './accounts.table';
import { AccountModelType } from '../../../renderer/stores/models/Account.model';
import { ThemeType } from 'renderer/stores/models/theme.model';
import { MasterAccount } from './masterAccounts.table';
// import { getCookie } from 'os/lib/shipHelpers';

export type AuthUpdateInit = {
  type: 'init';
  payload: AccountModelType[];
};

export type AuthUpdateLogin = {
  type: 'login';
  payload: {
    patp: string;
    token: string;
  };
};

export type AuthUpdateTypes = AuthUpdateInit | AuthUpdateLogin;
const isDev = process.env.NODE_ENV === 'development';

export type SessionType = {
  patp: string;
  key: string;
};

type LockFileType = {
  session?: SessionType;
};

const LockFileOptions = {
  name: 'realm.dev',
  fileExtension: 'lock',
};

export class AuthService extends AbstractService {
  private readonly authDB?: AuthDB;
  constructor(options?: ServiceOptions) {
    super('authService', options);
    if (options?.preload) {
      return;
    }
    this.authDB = new AuthDB();
    this.sendUpdate({
      type: 'init',
      payload: this.getAccounts(),
    });
    this._checkLockFile();
  }

  private _checkLockFile(): void {
    if (isDev) {
      const lockFile = new Store<LockFileType>(LockFileOptions);
      const session = lockFile.get('session');
      if (session) {
        const { patp, key } = session;
        this._setSession(patp, key);
      } else {
        this._clearSession();
      }
    }
  }

  private _setLockfile(patp: string, key: string): void {
    if (isDev) {
      const lockFile = new Store<LockFileType>(LockFileOptions);
      lockFile.set('session', { patp, key });
    }
  }

  public getAccounts(): Account[] {
    if (!this.authDB) return [];
    return this.authDB.tables.accounts.find();
  }

  public getAccount(patp: string): Account | null {
    if (!this.authDB) return null;
    return this.authDB.tables.accounts.findOne(patp);
  }

  public async createMasterAccount(mAccount: Omit<MasterAccount, 'id'>) {
    if (!this.authDB) return;
    // if a master account already exists, return

    // TODO implement password hashing and other account creation logic
    const newAccount = this.authDB.tables.masterAccounts.create(mAccount);
    if (newAccount) {
      // sends update to renderer with new account
      this.sendUpdate({
        type: 'init',
        payload: this.getAccounts(),
      });
    }

    return newAccount;
  }

  public async setAccountTheme(patp: string, theme: ThemeType) {
    if (!this.authDB) return;
    const account = this.authDB.tables.accounts.findOne(patp);
    if (account) {
      this.authDB.tables.accounts.update(patp, {
        theme: JSON.stringify(theme),
      });
    }
  }

  // Call this from onboarding.
  public createAccount(acc: Omit<Account, 'createdAt' | 'updatedAt'>): boolean {
    if (!this.authDB) return false;
    const existing = this.authDB.tables.accounts.findOne(acc.patp);
    if (existing) {
      log.info(`Account already exists for ${acc.patp}`);
      return false;
    }

    const newAccount = this.authDB.tables.accounts.create(acc);

    if (newAccount) {
      this.sendUpdate({
        type: 'init',
        payload: this.getAccounts(),
      });
      return true;
    } else {
      log.info(`Failed to create account for ${acc.patp}`);
      return false;
    }
  }

  /**
   *
   * @param patp
   * @param password
   * @returns boolean - true if login was successful, false otherwise
   */
  public login(patp: string, password: string): boolean {
    const account = this.authDB?.tables.accounts.findOne(patp);
    if (!account) {
      log.info(`No account found for ${patp}`);
      return false;
    }
    // TODO Add amplitude logging here
    const authenticated = this._verifyPassword(password, account.passwordHash);
    if (authenticated) {
      // this.sendUpdate({
      //   type: 'login',
      //   payload: {
      //     patp,
      //     token: 'TODO',
      //   },
      // });
      // this.deriveDbKey()
      return true;
    } else {
      log.info(`Failed to authenticate ${patp}`);
      return false;
    }
  }

  // TODO FINISH THIS FUNCTION REFACTOR
  public async updateShipCode(
    patp: string,
    password: string,
    code: string
  ): string {
    let result = '';
    try {
      const ship = this.authDB?.tables.accounts.findOne(patp);
      if (!ship) {
        throw new Error('ship not found');
      }

      if (ship.passwordHash === null) {
        throw new Error('login: passwordHash is null');
      }

      const passwordCorrect = await bcrypt.compare(password, ship.passwordHash);
      if (!passwordCorrect) {
        throw new Error('login: password is incorrect');
      }

      // this.core.passwords.setPassword(patp, password);

      // this.core.services.identity.auth.storeCredentials(ship.patp, password, {
      //   code: code,
      // });

      let cookie = null,
        connectConduit = false;
      // in the case of development or DEBUG_PROD builds, we auto connect at startup; therefore
      //  when this is the case, get a new cookie in order to refresh the conduit
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
      ) {
        // cookie = await getCookie({
        //   patp,
        //   url: ship.url,
        //   code: code,
        // });
        // connectConduit = true;
      }

      // this.core.setSession(
      //   {
      //     ship: ship.patp,
      //     url: ship.url,
      //     code,
      //     cookie: cookie ?? '',
      //   },
      //   connectConduit
      // );
      result = 'success';
    } catch (e) {
      // this.core.sendLog(e);
      // this.state.setLoader('error');
      result = 'error';
    }
    return result;
  }

  public _setSession(patp: string, key: string) {
    this._setLockfile(patp, key);
    this.authDB?._setSession(patp, key);
  }

  public _getSession(patp?: string): SessionType | null {
    if (!this.authDB) return null;
    return this.authDB?._getSession(patp);
  }

  get session(): SessionType | null {
    return this._getSession();
  }

  public _clearSession(patp?: string) {
    this.authDB?._clearSession(patp);
  }

  public _verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  public hasSeenSplash(): boolean {
    if (!this.authDB) return false;
    return this.authDB.hasSeenSplash();
  }

  public setSeenSplash(): void {
    this.authDB?.setSeenSplash();
    this.sendUpdate({
      type: 'seenSplash',
      payload: true,
    });
  }

  public async deriveDbKey(password: string) {
    const salt = crypto.randomBytes(16);
    return crypto
      .pbkdf2Sync(password, salt, 100000, 32, 'sha512')
      .toString('hex');
  }
}

export default AuthService;

// Generate preload
export const authPreload = AuthService.preload(
  new AuthService({ preload: true })
);

// public register(patp: string, password: string): boolean {
//   const account = this.authDB.models.accounts.findOne(patp);
//   if (account) {
//     log.info(`Account already exists for ${patp}`);
//     return false;
//   }
//   const passwordHash = bcrypt.hashSync(password, 10);
//   this.authDB.models.accounts.create({ patp, passwordHash });
//   // TODO Add amplitude logging here
//   return true;
// }
