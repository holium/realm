import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Store from 'electron-store';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { AuthDB } from './auth.db';
import { Account } from './accounts.table';
import { ThemeType } from 'renderer/stores/models/theme.model';
import { MasterAccount } from './masterAccounts.table';
import { ShipDB } from '../ship/ship.db';
import { getCookie } from '../../lib/shipHelpers';
import { AuthUpdateTypes } from './auth.types';

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

export class AuthService extends AbstractService<AuthUpdateTypes> {
  private readonly authDB?: AuthDB;
  constructor(options?: ServiceOptions) {
    super('authService', options);
    if (options?.preload) {
      return;
    }
    this.authDB = new AuthDB();
    this.sendUpdate({
      type: 'auth-init',
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

  public async createMasterAccount(
    mAccount: Omit<MasterAccount, 'id' | 'passwordHash'> & { password: string }
  ) {
    if (!this.authDB) return;
    // if a master account already exists, return
    try {
      const existingAccount = this.authDB.tables.masterAccounts.findOne(
        `email = "${mAccount.email}"`
      );
      if (existingAccount) return existingAccount;
    } catch (e) {
      console.log(e);
    }

    // TODO implement password hashing and other account creation logic
    const newAccount = this.authDB.tables.masterAccounts.create({
      email: mAccount.email,
      encryptionKey: mAccount.encryptionKey,
      authToken: mAccount.authToken,
      passwordHash: bcrypt.hashSync(mAccount.password, 10),
    });
    // if (newAccount) {
    //   // sends update to renderer with new account
    //   this.sendUpdate({
    //     type: 'init',
    //     payload: this.getAccounts(),
    //   });
    // }

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
  public createAccount(
    acc: Omit<Account, 'passwordHash' | 'createdAt' | 'updatedAt'>,
    shipCode: string
  ): {
    account?: Account;
    shipDB?: ShipDB;
  } {
    if (!this.authDB) return {};
    const masterAccount = this.authDB.tables.masterAccounts.findOne(
      acc.accountId
    );
    if (!masterAccount) {
      log.info(`No master account found for ${acc.patp}`);
      return {};
    }
    const existing = this.authDB.tables.accounts.findOne(acc.patp);
    if (existing) {
      log.info(`Account already exists for ${acc.patp}`);
      return {};
    }

    const newAccount = this.authDB.tables.accounts.create({
      accountId: acc.accountId,
      patp: acc.patp,
      url: acc.url,
      avatar: acc.avatar,
      nickname: acc.nickname,
      description: acc.description,
      color: acc.color,
      type: acc.type,
      status: acc.status,
      theme: acc.theme,
      passwordHash: masterAccount?.passwordHash,
    });
    this.authDB.addToOrder(acc.patp);
    // Creates the ship database with the master account's encryption key
    const shipDB = this._createShipDB(acc.patp, masterAccount.encryptionKey, {
      code: shipCode,
      url: acc.url,
    });

    if (newAccount) {
      this.sendUpdate({
        type: 'account-added',
        payload: {
          account: newAccount,
          order: this.authDB?.getOrder(),
        },
      });
      return { account: newAccount, shipDB };
    } else {
      log.info(`Failed to create account for ${acc.patp}`);
      return {};
    }
  }

  public updatePassport(
    patp: string,
    nickname: string,
    description: string,
    avatar: string
  ) {
    if (!this.authDB) return false;

    const account = this.authDB.tables.accounts.findOne(patp);

    if (!account) {
      log.info(`No account found for ${patp}`);
      return false;
    }

    const newAccount = this.authDB.tables.accounts.update(patp, {
      nickname,
      description,
      avatar,
    });

    if (newAccount) {
      this.sendUpdate({
        type: 'account-updated',
        payload: {
          account: newAccount,
          order: this.authDB?.getOrder(),
        },
      });
      return true;
    }

    return false;
  }

  public updatePassword(patp: string, password: string) {
    if (!this.authDB) return false;

    const account = this.authDB.tables.accounts.findOne(patp);

    if (!account) {
      log.info(`No account found for ${patp}`);
      return false;
    }

    const newAccount = this.authDB.tables.accounts.update(patp, {
      passwordHash: bcrypt.hashSync(password, 10),
    });

    if (newAccount) {
      this.sendUpdate({
        type: 'account-updated',
        payload: {
          account: newAccount,
          order: this.authDB?.getOrder(),
        },
      });
      return true;
    }

    return false;
  }

  private _createShipDB(
    patp: string,
    encryptionKey: string,
    credentials: {
      url: string;
      code: string;
      cookie?: string;
    }
  ) {
    const newShipDB = new ShipDB(patp, encryptionKey);
    log.info(
      `Created ship database for ${patp} with encryption key`,
      encryptionKey
    );
    if (!credentials.cookie) {
      log.info('No cookie found, getting cookie...');
      getCookie({
        patp,
        url: credentials.url,
        code: credentials.code,
      }).then((cookie) => {
        if (cookie) {
          newShipDB.setCredentials(credentials.url, credentials.code, cookie);
        } else {
          log.error('Failed to get cookie');
        }
      });
    } else {
      log.info('Cookie found, setting credentials...');
      newShipDB.setCredentials(
        credentials.url,
        credentials.code,
        credentials.cookie
      );
    }

    return newShipDB;
  }

  private _deleteShipDB(patp: string) {
    const dbPath = path.join(app.getPath('userData'), `${patp}.sqlite`);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  }

  public deleteAccount(patp: string): void {
    if (!this.authDB) return;
    const account = this.authDB.tables.accounts.findOne(patp);
    if (!account) {
      log.info(`No account found for ${patp}`);
      return;
    }

    this.authDB.tables.accounts.delete(patp);
    this.authDB.removeFromOrder(patp);

    this.sendUpdate({
      type: 'account-removed',
      payload: {
        account,
        order: this.authDB?.getOrder(),
      },
    });
    this._deleteShipDB(patp);
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
      return false;
    }
  }

  // TODO FINISH THIS FUNCTION REFACTOR
  public async updateShipCode(patp: string, password: string) {
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
    // this.authDB?._setSession(patp, key);
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
      type: 'seen-splash',
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
