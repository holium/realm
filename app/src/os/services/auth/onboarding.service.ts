import log from 'electron-log';
import bcrypt from 'bcryptjs';

import { cleanNounColor, removeHash } from '../../lib/color';
import { getCookie } from '../../lib/shipHelpers';
import {
  CreateAccountPayload,
  CreateMasterAccountPayload,
} from '../../realm.types';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection } from '../api';
import { ShipDB } from '../ship/ship.db';
import { Account } from './accounts.table';
import { AuthDB } from './auth.db';
import { MasterAccount } from './masterAccounts.table';
import { OnboardingUpdateTypes } from './onboarding.types';

type OnboardingCredentials = {
  patp: string;
  url: string;
  code: string;
};

export class OnboardingService extends AbstractService<OnboardingUpdateTypes> {
  private authDB?: AuthDB;
  private credentials?: OnboardingCredentials;
  constructor(options?: ServiceOptions) {
    super('onboardingService', options);
    if (options?.preload) {
      return;
    }
    this.authDB = new AuthDB();
    log.info('onboarding.service.ts:', 'Constructed.');
  }

  public setCredentials(credentials: OnboardingCredentials) {
    this.credentials = credentials;
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

  // Call this from onboarding.
  public async createAccount(
    acc: CreateAccountPayload,
    password: string,
    shipCode: string
  ): Promise<{
    account?: Account;
    masterAccount?: MasterAccount;
  }> {
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

    const cookie = await this.getCookie(acc.patp, acc.url, shipCode);

    this._createShipDB(newAccount.patp, password, masterAccount.encryptionKey, {
      url: newAccount.url,
      code: shipCode,
      cookie,
    });

    if (newAccount) {
      this.sendUpdate({
        type: 'account-added',
        payload: {
          account: newAccount,
          order: [],
        },
      });
      return { account: newAccount, masterAccount };
    } else {
      log.info('auth.service.ts:', `Failed to create account for ${acc.patp}`);
      return { masterAccount };
    }
  }

  public triggerOnboardingEnded() {
    if (!this.authDB) {
      throw new Error('No authDB found');
    }
    this.sendUpdate({
      type: 'onboarding-ended',
      payload: {
        accounts: this.authDB.tables.accounts.find(),
        order: this.authDB?.getOrder(),
      },
    });
  }

  public hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  async getPassport() {
    if (!this.credentials) return;
    log.info('onboarding.service.ts:', 'Getting passport');
    await this._openConduit();
    log.info('onboarding.service.ts:', 'got conduit');
    const passport = await APIConnection.getInstance().conduit.scry({
      app: 'friends',
      path: `/contact/${this.credentials.patp}`,
    });
    if (passport) {
      passport.color = cleanNounColor(passport.color);
    }
    return passport;
  }

  async updatePassport(
    patp: string,
    data: {
      nickname: string;
      avatar?: string;
      color?: string;
      bio?: string;
      cover?: string;
    }
  ) {
    if (!this.credentials) return;
    log.info('onboarding.service.ts:', 'Getting passport');
    await this._openConduit();
    const preparedData: Record<string, any> = {
      nickname: data.nickname,
      color: data.color ? removeHash(data.color) : null,
      avatar: data.avatar ?? null,
      bio: data.bio || null,
      cover: data.cover ?? null,
    };
    const payload = {
      app: 'friends',
      mark: 'friends-action',
      json: {
        'set-contact': {
          ship: patp,
          'contact-info': preparedData,
        },
      },
    };
    return APIConnection.getInstance().conduit.poke(payload);
  }

  async installRealmAgent() {
    await this._openConduit();
    try {
      APIConnection.getInstance().conduit.poke({
        app: 'hood',
        mark: 'kiln-install',
        json: {
          ship: '~hostyv',
          desk: 'realm',
          local: 'realm',
        },
      });
    } catch (e) {
      log.error(e);
    }
    return true;
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

  private async _openConduit() {
    if (!this.credentials) return;
    const { url, code, patp } = this.credentials;
    const cookie = await this.getCookie(patp, url, code);
    return new Promise((resolve, reject) => {
      if (!this.credentials) return;
      APIConnection.getInstance({
        url: url,
        code: code,
        ship: patp,
        cookie,
      })
        .conduit.on('connected', () => {
          resolve(null);
        })
        .on('error', (err: any) => {
          log.error('ship.service.ts:', 'Conduit error', err);
          reject(err);
        });
    });
  }

  private _createShipDB(
    patp: string,
    password: string,
    encryptionKey: string,
    credentials: {
      url: string;
      code: string;
      cookie: string;
    }
  ) {
    const newShipDB = new ShipDB(patp, password, encryptionKey);
    newShipDB.setCredentials(
      credentials.url,
      credentials.code,
      credentials.cookie
    );

    log.info(
      `Created ship database for ${patp} with encryption key`,
      encryptionKey
    );
    return;
  }
}

export default OnboardingService;

// Generate preload
export const onboardingPreload = OnboardingService.preload(
  new OnboardingService({ preload: true })
);
