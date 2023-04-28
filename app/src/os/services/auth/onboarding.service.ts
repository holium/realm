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
import {
  OnboardingUpdateTypes,
  RealmInstallVersionTest,
} from './onboarding.types';

import { RealmInstallStatus } from '@holium/shared/src/onboarding/types';

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

  _prepareBuildVersionEnv() {
    let result: RealmInstallVersionTest = {
      success: false, // assume failure
      major: -1,
      minor: -1,
      build: -1,
    };
    console.log(
      `preparing build version env var '${process.env.BUILD_VERSION}'`
    );
    if (!process.env.BUILD_VERSION) {
      console.warn(
        'BUILD_VERSION environment variable not set. skipping installation validation...'
      );
      return result;
    }
    let buildVersion = process.env.BUILD_VERSION.split('.');
    if (buildVersion.length < 3) {
      console.warn(
        `BUILD_VERSION '${buildVersion}' not valid. skipping installation validation...`
      );
      return result;
    }
    // move beyond the v portion of the version string
    if (buildVersion[0].trim().startsWith('v')) {
      buildVersion[0] = buildVersion[0].substring(1);
    }
    // strip the channel
    const idx = buildVersion[2].lastIndexOf('-');
    if (idx !== -1) {
      buildVersion[2] = buildVersion[2].substring(0, idx);
    }
    result.success = true;
    result.major = parseInt(buildVersion[0]);
    result.minor = parseInt(buildVersion[1]);
    result.build = parseInt(buildVersion[2]);
    return result;
  }

  async _testVersion(buildVersion: any): Promise<boolean> {
    try {
      const res = await APIConnection.getInstance().conduit.scry({
        app: 'bazaar',
        path: `/version`,
      });
      const parts = res.version.split('.');
      if (parseInt(parts[0]) > parseInt(buildVersion.major)) {
        return true;
      }
      if (
        parseInt(parts[0]) >= parseInt(buildVersion.major) &&
        parseInt(parts[1]) > parseInt(buildVersion.minor)
      ) {
        return true;
      }
      if (
        parseInt(parts[0]) >= parseInt(buildVersion.major) &&
        parseInt(parts[1]) >= parseInt(buildVersion.minor) &&
        parseInt(parts[2]) >= parseInt(buildVersion.build)
      ) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  async _waitForInstallRealmAgent(
    buildVersion: any
  ): Promise<RealmInstallStatus> {
    const self = this;
    return new Promise((resolve) => {
      let totalWaitTime = 0,
        maxWaitTime = 300000; // 5 minutes
      (async function versionCheck(totalWaitTime, maxWaitTime) {
        const result = await self._testVersion(buildVersion);
        if (result) {
          resolve({ success: true });
          return;
        }
        totalWaitTime += 3000;
        if (totalWaitTime > maxWaitTime) {
          resolve({ success: false, message: 'timeout' });
          return;
        }
        setTimeout(() => versionCheck(totalWaitTime, maxWaitTime), 3000);
      })(totalWaitTime, maxWaitTime);
    });
  }

  async installRealmAgent(): Promise<RealmInstallStatus> {
    return new Promise(async (resolve, reject) => {
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

        // @note: if %realm is already installed and does not need to be updated, there is
        //   currently no way to get notified by clay (gift) that the kiln-install operation
        //   has completed. in the meantime, a workaround is to scry the %realm agent, and
        //   if the current version matches the agent's version, assume the install is finished

        const buildVersion = this._prepareBuildVersionEnv();
        if (!buildVersion.success) {
          resolve({ success: false, message: 'BUILD_VERSION env var invalid' });
          return;
        }
        const result = await this._waitForInstallRealmAgent(buildVersion);
        resolve(result);
      } catch (e) {
        log.error(e);
        reject('error');
      }
    });
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
