import { app } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { ThemeType } from '@holium/shared';

import AbstractService, { ServiceOptions } from '../abstract.service';
import { ConduitSession } from '../api';
import { MigrationService } from '../migration/migration.service';
import { ContactResponse } from '../ship/friends/friends.service';
import ShipService from '../ship/ship.service';
import { DBAccount } from './accounts.table';
import { AuthDB } from './auth.db';
import { AuthUpdateTypes } from './auth.types';

type LockFileType = {
  session?: ConduitSession;
  lastWindowBounds?: Electron.Rectangle;
  lastDisplay?: Electron.Display;
  isFullscreen?: boolean;
};

export type LastWindowMetadata = {
  lastWindowBounds?: Electron.Rectangle;
  lastDisplay?: Electron.Display;
  isFullscreen?: boolean;
};

const LockFileOptions = {
  name: 'session',
  fileExtension: 'lock',
};

const getLockFileOptions = () => {
  console.log(
    'getLockFileOptions => %o',
    process.env.SESSION_FILENAME || 'session.lock'
  );
  const result = LockFileOptions;
  if (process.env.SESSION_FILENAME) {
    const parts = process.env.SESSION_FILENAME.split('.');
    if (parts.length > 0) {
      result.name = parts[0];
      if (parts.length > 1) {
        result.fileExtension = parts[1];
      }
    }
  }
  return result;
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

  public async setAccountTheme(serverId: string, theme: ThemeType) {
    if (!this.authDB) return;
    const account = this.authDB.tables.accounts.findOne(serverId);
    if (account) {
      this.authDB.tables.accounts.update(serverId, {
        theme: JSON.stringify(theme),
      });
    }
  }

  public setPassport(patp: string, passport: ContactResponse) {
    if (!this.authDB) return;
    const account = this.authDB.tables.accounts.findOne(patp);
    if (account) {
      const updated = this.authDB.tables.accounts.update(patp, {
        nickname: passport.nickname,
        avatar: passport.avatar,
        color: passport.color,
      });
      this.sendUpdate({
        type: 'account-updated',
        payload: {
          account: updated,
          order: this.authDB?.getOrder(),
        },
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
    MigrationService.getInstance()._deleteShip(serverId);
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

  public setLastWindowBounds(bounds: Electron.Rectangle) {
    const options = getLockFileOptions();
    const lockFile = new Store<LockFileType>(options);
    lockFile.set('lastWindowBounds', bounds);
  }

  public setLastDisplay(display: Electron.Display) {
    const options = getLockFileOptions();
    const lockFile = new Store<LockFileType>(options);
    lockFile.set('lastDisplay', display);
  }

  public setLastFullscreenStatus(isFullscreen: boolean) {
    const options = getLockFileOptions();
    const lockFile = new Store<LockFileType>(options);
    lockFile.set('isFullscreen', isFullscreen);
  }

  public getLastWindowMetadata(): any {
    const options = getLockFileOptions();
    const lockFile = new Store<LockFileType>(options);
    return {
      lastDisplay: lockFile.get('lastDisplay'),
      lastWindowBounds: lockFile.get('lastWindowBounds'),
      isFullscreen: lockFile.get('isFullscreen'),
    };
  }

  public _setLockfile(session: ConduitSession): void {
    const options = getLockFileOptions();
    log.info(
      'auth.service.ts:',
      `Setting ${options.name}.${options.fileExtension}...`
    );
    const lockFile = new Store<LockFileType>(options);
    lockFile.set('session', session);
  }

  public _getLockfile(): ConduitSession | null {
    const lockFile = new Store<LockFileType>(getLockFileOptions());
    return lockFile.get('session') || null;
  }

  public _clearLockfile(): void {
    const options = getLockFileOptions();
    const filename = `${options.name}.${options.fileExtension}`;
    log.info(`Clearing ${filename}...`);
    fs.unlinkSync(path.join(app.getPath('userData'), filename));
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
