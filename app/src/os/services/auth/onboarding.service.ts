import log from 'electron-log';
import bcrypt from 'bcryptjs';

import { RealmInstallStatus } from '@holium/shared/src/onboarding/types';

import { cleanNounColor, removeHash } from '../../lib/color';
import { getCookie } from '../../lib/shipHelpers';
import {
  CreateAccountPayload,
  CreateMasterAccountPayload,
} from '../../realm.types';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection } from '../api';
import { ShipDB } from '../ship/ship.db';
import { DBAccount } from './accounts.table';
import { AuthDB } from './auth.db';
import { MasterAccount } from './masterAccounts.table';
import {
  OnboardingUpdateTypes,
  RealmInstallVersionTest,
} from './onboarding.types';

type OnboardingCredentials = {
  serverId: string;
  serverUrl: string;
  serverCode: string;
};

export class OnboardingService extends AbstractService<OnboardingUpdateTypes> {
  private authDB?: AuthDB;
  private credentials?: OnboardingCredentials;
  private cookie?: string;
  private cookieAt?: number;

  constructor(options?: ServiceOptions) {
    super('onboardingService', options);
    if (options?.preload) {
      return;
    }
    this.authDB = new AuthDB();
    this.cookieAt = 0;
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
    account?: DBAccount;
    masterAccount?: MasterAccount;
  }> {
    if (!this.authDB) return {};

    const masterAccount = this.authDB.tables.masterAccounts.findOne(
      acc.accountId
    );
    if (!masterAccount) {
      log.info(
        'auth.service.ts:',
        `No master account found for ${acc.serverId}`
      );
      return {};
    }

    const existing = this.authDB.tables.accounts.findOne(acc.serverId);
    if (existing) {
      log.info(
        'auth.service.ts:',
        `Account already exists for ${acc.serverId}`
      );
      return { account: existing, masterAccount };
    }

    const newAccount = this.authDB.tables.accounts.create({
      accountId: acc.accountId,
      serverId: acc.serverId,
      serverUrl: acc.serverUrl,
      serverType: acc.serverType,
      avatar: acc.avatar,
      nickname: acc.nickname,
      description: acc.description,
      color: acc.color,
      status: acc.status,
      theme: acc.theme,
      passwordHash: masterAccount?.passwordHash,
    });
    this.authDB.addToOrder(acc.serverId);

    const cookie = await this.getCookie(acc.serverId, acc.serverUrl, shipCode);
    log.info('auth.service.ts:', `Got cookie for ${acc.serverId}`);
    this._createShipDB(
      newAccount.serverId,
      password,
      masterAccount.encryptionKey,
      {
        serverUrl: newAccount.serverUrl,
        serverCode: shipCode,
        cookie,
      }
    );

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
      log.info(
        'auth.service.ts:',
        `Failed to create account for ${acc.serverId}`
      );
      return { masterAccount };
    }
  }

  public hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  async getPassport() {
    if (!this.credentials)
      return Promise.reject('getPassport: No credentials found');
    log.info('onboarding.service.ts:', 'Getting passport');
    await this._openConduit();
    log.info('onboarding.service.ts:', 'got conduit');
    const passport = await APIConnection.getInstance().conduit.scry({
      app: 'friends',
      path: `/contact/${this.credentials.serverId}`,
    });
    if (passport) {
      passport.color = cleanNounColor(passport.color);
    }
    return passport;
  }

  updatePassword(email: string, password: string) {
    if (!this.authDB) {
      log.error('auth.service.ts:', 'updatePassword', 'No authDB found');
      return false;
    }

    const masterAccount = this.authDB.tables.masterAccounts.findFirst(
      "email = '" + email + "'"
    );
    if (!masterAccount) {
      log.error(
        'auth.service.ts:',
        'updatePassword',
        `No master account found for ${email}`
      );
      return false;
    }

    const accounts = this.authDB.tables.accounts.findAll(masterAccount.id);
    if (!accounts || accounts.length === 0) {
      log.error(
        'auth.service.ts:',
        'updatePassword',
        `No accounts found for masterAccount ${masterAccount.id}`
      );
      return false;
    }

    const masterAccountResult = this.authDB.tables.masterAccounts.update(
      masterAccount.id,
      {
        passwordHash: this.hashPassword(password),
      }
    );
    if (masterAccountResult) {
      log.info(
        'auth.service.ts:',
        'updatePassword',
        `Updated password for masterAccount ${masterAccount.id}`
      );
    } else {
      log.error(
        'auth.service.ts:',
        'updatePassword',
        `Failed to update password for masterAccount ${masterAccount.id}`
      );
      return false;
    }

    const results = accounts.map((account) => {
      const accountResult = this.authDB?.tables.accounts.update(
        account.serverId,
        {
          passwordHash: this.hashPassword(password),
        }
      );
      if (accountResult) {
        log.info(
          'auth.service.ts:',
          'updatePassword',
          `Updated password for ${account.serverId}`
        );
        return true;
      } else {
        log.error(
          'auth.service.ts:',
          'updatePassword',
          `Failed to update password for ${account.serverId}`
        );
        return false;
      }
    });

    return results.every((result) => result);
  }

  async updatePassport(
    serverId: string,
    data: {
      nickname: string;
      avatar?: string;
      color?: string;
      bio?: string;
      cover?: string;
    }
  ) {
    if (!this.credentials)
      return Promise.reject('updatePassport: No credentials found');
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
          ship: serverId,
          'contact-info': preparedData,
        },
      },
    };
    try {
      APIConnection.getInstance().conduit.poke(payload);
    } catch (e) {
      log.error('onboarding.service.ts:', 'updatePassport', e);
    }
    return preparedData;
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

  async _testVersion(buildVersion: RealmInstallVersionTest): Promise<boolean> {
    try {
      const res = await APIConnection.getInstance().conduit.scry({
        app: 'bazaar',
        path: `/version`,
      });
      log.info(
        'onboarding.service.ts:',
        'testVersion',
        res.version,
        'vs',
        `${buildVersion.major}.${buildVersion.minor}.${buildVersion.build}`
      );
      const parts = res.version.split('.');
      if (parseInt(parts[0]) > buildVersion.major) {
        return true;
      }
      if (
        parseInt(parts[0]) >= buildVersion.major &&
        parseInt(parts[1]) > buildVersion.minor
      ) {
        return true;
      }
      if (
        parseInt(parts[0]) >= buildVersion.major &&
        parseInt(parts[1]) >= buildVersion.minor &&
        parseInt(parts[2]) >= buildVersion.build
      ) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  private async waitForInstallRealmAgent(
    buildVersion: RealmInstallVersionTest
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
      // if bypass, don't perform install and continue with onboarding. useful in development
      if (process.env.INSTALL_MOON === 'bypass') {
        resolve({ success: true });
        return;
      }
      await this._openConduit();
      try {
        APIConnection.getInstance().conduit.poke({
          app: 'hood',
          mark: 'kiln-install',
          json: {
            ship:
              process.env.RELEASE_CHANNEL === 'latest' ||
              process.env.RELEASE_CHANNEL === 'hotfix'
                ? '~hostyv'
                : '~nimwyd-ramwyl-dozzod-hostyv',
            desk: 'realm',
            local: 'realm',
          },
        });
        log.info('onboarding.service.ts:', 'installRealmAgent', 'poke sent');

        // @note: if %realm is already installed and does not need to be updated, there is
        //   currently no way to get notified by clay (gift) that the kiln-install operation
        //   has completed. in the meantime, a workaround is to scry the %realm agent, and
        //   if the current version matches the agent's version, assume the install is finished

        const buildVersion = this._prepareBuildVersionEnv();
        if (!buildVersion.success) {
          resolve({ success: false, message: 'BUILD_VERSION env var invalid' });
          return;
        }
        if (process.env.NODE_ENV === 'development') {
          resolve({ success: true, message: '' });
          return;
        }
        const result = await this.waitForInstallRealmAgent(buildVersion);
        resolve(result);
      } catch (e) {
        log.error(e);
        reject('error');
      }
    });
  }

  public async getCookie(
    serverId: string,
    serverUrl: string,
    serverCode: string
  ) {
    try {
      const now: number = Date.now();
      if (this.cookie && this.cookieAt && now - this.cookieAt < 3000) {
        // cache cookie for 3 seconds to prevent hammering urbit /~/login in quick succession
        return this.cookie;
      }

      const cookie = await getCookie({ serverId, serverUrl, serverCode });
      if (!cookie) throw new Error('Failed to get cookie');
      const cookiePatp = cookie.split('=')[0].replace('urbauth-', '');
      const sanitizedCookie = cookie.split('; ')[0];
      log.info('ship.service.ts:', 'cookie', sanitizedCookie);
      log.info(
        'ship.service.ts:',
        'ids',
        serverId.toLowerCase(),
        cookiePatp.toLowerCase()
      );

      if (serverId.toLowerCase() !== cookiePatp.toLowerCase()) {
        throw new Error('Invalid serverCode.');
      }

      this.cookie = sanitizedCookie;
      this.cookieAt = Date.now();

      return sanitizedCookie;
    } catch (e) {
      log.error('ship.service.ts:', 'Failed to get cookie', e);
      throw e;
    }
  }

  public getMasterAccount(id: number) {
    if (!this.authDB) {
      log.error('onboarding.service.ts:', 'No authDB');
      return;
    }

    return this.authDB.tables.masterAccounts.findFirst("id = '" + id + "'");
  }

  private async _openConduit() {
    if (!this.credentials)
      return Promise.reject('_openConduit: No credentials');
    const { serverUrl, serverCode, serverId } = this.credentials;
    const cookie = await this.getCookie(serverId, serverUrl, serverCode);
    return new Promise((resolve, reject) => {
      APIConnection.getInstance({
        url: serverUrl,
        code: serverCode,
        ship: serverId,
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
    serverId: string,
    password: string,
    encryptionKey: string,
    credentials: {
      serverUrl: string;
      serverCode: string;
      cookie: string;
    }
  ) {
    log.info(
      'Creating ship database',
      serverId,
      encryptionKey,
      password,
      credentials
    );
    const newShipDB = new ShipDB(serverId, password, encryptionKey);
    newShipDB.setCredentials(
      credentials.serverUrl,
      credentials.serverCode,
      credentials.cookie
    );

    log.info(
      `Created ship database for ${serverId} with encryption key`,
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
