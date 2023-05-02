import { app } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { ThemeType } from 'renderer/stores/models/theme.model';

import AbstractService, { ServiceOptions } from '../abstract.service';
import { ConduitSession } from '../api';
import ShipService from '../ship/ship.service';
import { DBAccount } from './accounts.table';
import { AuthDB } from './auth.db';
import { AuthUpdateTypes } from './auth.types';
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

  public getAccounts(): DBAccount[] {
    if (!this.authDB) return [];
    return this.authDB.tables.accounts.find();
  }

  public getAccount(serverId: string): DBAccount | null {
    if (!this.authDB) return null;
    return this.authDB.tables.accounts.findOne(serverId);
  }

  public getMasterAccount(id: string): MasterAccount | null {
    if (!this.authDB) return null;
    return this.authDB.tables.masterAccounts.findOne(`id = "${id}"`);
  }

  public async setAccountTheme(serverId: string, theme: ThemeType) {
    if (!this.authDB) return;
    const account = this.authDB.tables.accounts.findOne(serverId);
    if (account) {
      this.authDB.tables.accounts.update(serverId, {
        theme: JSON.stringify(theme),
      });
    }
  }

  public updatePassport(
    serverId: string,
    nickname: string,
    description?: string,
    avatar?: string,
    color?: string
  ) {
    if (!this.authDB) return false;

    const account = this.authDB.tables.accounts.findOne(serverId);

    if (!account) {
      log.info('auth.service.ts:', `No account found for ${serverId}`);
      return false;
    }

    const updatedAccount = this.authDB.tables.accounts.update(serverId, {
      nickname,
      description,
      avatar,
      color,
    });

    if (updatedAccount) {
      log.info('auth.service.ts:', `Updated passport for account ${serverId}`);
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

  public updatePassword(serverId: string, password: string) {
    if (!this.authDB) return false;

    const account = this.authDB.tables.accounts.findOne(serverId);

    if (!account) {
      log.info('auth.service.ts:', `No account found for ${serverId}`);
      return false;
    }

    const updatedAccount = this.authDB.tables.accounts.update(serverId, {
      passwordHash: bcrypt.hashSync(password, 10),
    });

    if (updatedAccount) {
      log.info('auth.service.ts:', `Updated password for account ${serverId}`);
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

  public deleteAccount(serverId: string): void {
    if (!this.authDB) return;
    const account = this.authDB.tables.accounts.findOne(serverId);
    if (!account) {
      log.info('auth.service.ts:', `No account found for ${serverId}`);
      return;
    }

    this.authDB.tables.accounts.delete(serverId);
    this.authDB.removeFromOrder(serverId);

    this.sendUpdate({
      type: 'account-removed',
      payload: {
        account,
        order: this.authDB?.getOrder(),
      },
    });
    ShipService._deleteShipDB(serverId);
  }
  /**
   *
   * @param serverId
   * @param password
   * @returns boolean - true if login was successful, false otherwise
   */
  public login(serverId: string, password: string): boolean {
    const account = this.authDB?.tables.accounts.findOne(serverId);

    if (!account) {
      log.info('auth.service.ts:', `No account found for ${serverId}`);
      return false;
    }
    // TODO Add amplitude logging here
    const authenticated = this._verifyPassword(password, account.passwordHash);
    if (authenticated) {
      // this.sendUpdate({
      //   type: 'login',
      //   payload: {
      //     serverId,
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
  public async updateShipCode(serverId: string, password: string) {
    let result = '';
    try {
      const ship = this.authDB?.tables.accounts.findOne(serverId);
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

      // this.core.passwords.setPassword(serverId, password);

      // this.core.services.identity.auth.storeCredentials(ship.serverId, password, {
      //   code: code,
      // });

      // in the case of development or DEBUG_PROD builds, we auto connect at startup; therefore
      //  when this is the case, get a new cookie in order to refresh the conduit
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
      ) {
        // cookie = await getCookie({
        //   serverId,
        //   url: ship.url,
        //   code: code,
        // });
        // connectConduit = true;
      }

      // this.core.setSession(
      //   {
      //     ship: ship.serverId,
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

// public register(serverId: string, password: string): boolean {
//   const account = this.authDB.models.accounts.findOne(serverId);
//   if (account) {
//     log.info('auth.service.ts:', `Account already exists for ${serverId}`);
//     return false;
//   }
//   const passwordHash = bcrypt.hashSync(password, 10);
//   this.authDB.models.accounts.create({ serverId, passwordHash });
//   // TODO Add amplitude logging here
//   return true;
// }
