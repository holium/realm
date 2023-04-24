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
import { CreateMasterAccountPayload } from 'os/realm.types';
import { AuthUpdateTypes } from './auth.types';
import { ConduitSession } from '../api';
import { MasterAccount } from './masterAccounts.table';

const isDev = process.env.NODE_ENV === 'development';

type LockFileType = {
  session?: ConduitSession;
};

const LockFileOptions = {
  name: 'session',
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
    masterAccountPayload: CreateMasterAccountPayload
  ) {
    if (!this.authDB) return;

    // if a master account already exists, return
    try {
      const existingAccount = this.authDB.tables.masterAccounts.findOne(
        `email = "${masterAccountPayload.email}"`
      );
      if (existingAccount) return existingAccount;
    } catch (e) {
      console.error(e);
    }

    // TODO implement password hashing and other account creation logic
    const newAccount = this.authDB.tables.masterAccounts.create({
      email: masterAccountPayload.email,
      encryptionKey: masterAccountPayload.encryptionKey,
      authToken: masterAccountPayload.authToken,
      passwordHash: masterAccountPayload.passwordHash,
    });

    if (newAccount) {
      //if (this.authDB._needsMigration()) this.authDB.migrateJsonToSqlite(newAccount.id);

      log.info(
        'auth.service.ts:',
        `Created master account for ${masterAccountPayload.email}`
      );
    } else {
      log.error(
        'auth.service.ts:',
        `Failed to create master account for ${masterAccountPayload.email}`
      );
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
  public createAccount(
    acc: Omit<Account, 'passwordHash' | 'createdAt' | 'updatedAt'>
  ): {
    account?: Account;
    masterAccount?: MasterAccount;
  } {
    if (!this.authDB) return {};

    const masterAccount = this.authDB.tables.masterAccounts.findOne(
      acc.accountId
    );
    if (!masterAccount) {
      log.info('auth.service.ts:', `No master account found for ${acc.patp}`);
      return {};
    }

    const existing = this.authDB.tables.accounts.findOne(acc.patp);
    if (existing) {
      log.info('auth.service.ts:', `Account already exists for ${acc.patp}`);
      return { account: existing, masterAccount };
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

    if (newAccount) {
      this.sendUpdate({
        type: 'account-added',
        payload: {
          account: newAccount,
          order: this.authDB?.getOrder(),
        },
      });

      return { account: newAccount, masterAccount };
    } else {
      log.info('auth.service.ts:', `Failed to create account for ${acc.patp}`);
      return { masterAccount };
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
      log.info('auth.service.ts:', `No account found for ${patp}`);
      return false;
    }

    const updatedAccount = this.authDB.tables.accounts.update(patp, {
      nickname,
      description,
      avatar,
    });

    if (updatedAccount) {
      this.sendUpdate({
        type: 'account-updated',
        payload: {
          account: updatedAccount,
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
      log.info('auth.service.ts:', `No account found for ${patp}`);
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
      log.info('auth.service.ts:', `No account found for ${patp}`);
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
      log.info('auth.service.ts:', `No account found for ${patp}`);
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

  public logout(): void {
    // TODO Add amplitude logging here
    this._clearLockfile();
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

  public _verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  public _setLockfile(session: ConduitSession): void {
    if (isDev) {
      log.info('auth.service.ts:', 'Setting session.lock');
      const lockFile = new Store<LockFileType>(LockFileOptions);
      lockFile.set('session', session);
    }
  }

  public _getLockfile(): ConduitSession | null {
    if (isDev) {
      const lockFile = new Store<LockFileType>(LockFileOptions);
      return lockFile.get('session') || null;
    }
    return null;
  }

  public _clearLockfile(): void {
    if (isDev) {
      log.info('Clearing session.lock');
      fs.unlinkSync(path.join(app.getPath('userData'), 'session.lock'));
    }
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
//     log.info('auth.service.ts:', `Account already exists for ${patp}`);
//     return false;
//   }
//   const passwordHash = bcrypt.hashSync(password, 10);
//   this.authDB.models.accounts.create({ patp, passwordHash });
//   // TODO Add amplitude logging here
//   return true;
// }
