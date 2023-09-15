import { app } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import moment from 'moment';
import path from 'path';

import { S3Client, StorageAcl } from '../../../renderer/lib/S3Client';
import { getCookie } from '../../lib/shipHelpers';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection, ConduitSession } from '../api';
import AuthService from '../auth/auth.service';
import { SqliteDbManager } from './bedrock/bedrock.db';
import BedrockService from './bedrock/bedrock.service';
import ChatService from './chat/chat.service';
import { FriendsService } from './friends/friends.service';
import LexiconService from './lexicon/lexicon.service';
import { NotesService } from './notes/notes.service';
import NotificationsService from './notifications/notifications.service';
import { SettingsService } from './settings/settings.service';
import { ShipDB } from './ship.db';
import { Credentials } from './ship.types.ts';
import BazaarService from './spaces/bazaar.service';
import SpacesService from './spaces/spaces.service';
import TroveService from './trove/trove.service';
import WalletService from './wallet/wallet.service';

export type S3CredentialsAndConfig = {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
  };
  configuration: {
    currentBucket: string;
    region: string;
  };
};

export class ShipService extends AbstractService<any> {
  public patp: string;
  private shipDB?: ShipDB;
  private serviceOptions: ServiceOptions = { preload: false, verbose: false };
  private authService: AuthService | null = null;
  services?: {
    notifications: NotificationsService;
    chat: ChatService;
    bedrock: BedrockService;
    friends: FriendsService;
    spaces: SpacesService;
    bazaar: BazaarService;
    wallet: WalletService;
    notes: NotesService;
    lexicon: LexiconService;
    trove: TroveService;
    settings: SettingsService;
  };

  constructor(
    patp: string,
    password: string,
    clientSideEncryptionKey: string,
    options?: ServiceOptions
  ) {
    super('shipService', options);
    this.patp = patp;
    if (options?.preload) return;
    if (options) {
      this.serviceOptions = options;
    }
    this.shipDB = new ShipDB(this.patp, password, clientSideEncryptionKey);
    // this.encryptDb(password);
    if (options?.verbose) {
      log.info(
        'ship.service.ts:',
        `Created ship database for ${patp} with client-side encryption key`,
        clientSideEncryptionKey
      );
    }
    app.on('quit', () => {
      this.shipDB?.disconnect();
    });
  }

  public async construct() {
    if (!this.shipDB) return;
    const credentials = this.shipDB.getCredentials();
    if (!credentials.cookie) {
      if (this.serviceOptions?.verbose) {
        log.info('ship.service.ts:', 'No cookie found, getting cookie...');
      }
      try {
        const cookie = await getCookie({
          serverUrl: credentials.url,
          serverCode: credentials.code,
        });
        if (cookie) {
          if (this.serviceOptions?.verbose) {
            log.info('ship.service.ts:', 'Got cookie, setting credentials...');
          }
          this.setCredentials(credentials.url, credentials.code, cookie);
          await this._openConduit({ ...credentials, patp: this.patp, cookie });
          this._registerServices();
        } else {
          log.error('ship.service.ts:', 'Failed to get cookie');
        }
      } catch (e) {
        log.error(e);
      }
    } else {
      await this._openConduit(credentials);
      this._registerServices();
    }
  }

  async _openConduit(credentials: any) {
    return new Promise((resolve, reject) => {
      APIConnection.getInstance({
        ...credentials,
        ship: this.patp,
      })
        .conduit.on('connected', () => {
          resolve(null);
        })
        .on('failed', () => {
          log.info('ship.service.ts:', 'Conduit failed');
          this.shipDB?.setCredentials(credentials.url, credentials.code, null);
          this.authService?._setLockfile({ ...credentials, cookie: null });
          APIConnection.getInstance().closeChannel();
          resolve(null);
        })
        .on('refreshed', (session: ConduitSession) => {
          // log.info('ship.service.ts:', 'Conduit refreshed', session);
          this.shipDB?.setCredentials(
            session.url,
            session.code,
            session.cookie
          );
          resolve(null);
        })
        .on('error', (err: any) => {
          log.error('ship.service.ts:', 'Conduit error', err);
          reject(err);
        });
    });
  }

  private _registerServices() {
    if (!this.shipDB) return;
    log.info(
      'ship.service.ts:',
      'Creating ship sub-services (rooms, notifications, chat, friends, spaces, bazaar)...'
    );
    this.services = {
      chat: new ChatService(this.serviceOptions, this.shipDB.db),
      bedrock: new BedrockService(
        this.serviceOptions,
        new SqliteDbManager({ db: this.shipDB.db })
      ),
      notifications: new NotificationsService(
        this.serviceOptions,
        this.shipDB.db
      ),
      bazaar: new BazaarService(this.serviceOptions, this.shipDB.db),
      spaces: new SpacesService(this.serviceOptions, this.shipDB.db, this.patp),
      friends: new FriendsService(this.serviceOptions, this.shipDB.db),
      wallet: new WalletService(undefined, this.shipDB.db),
      notes: new NotesService(undefined, this.shipDB.db),
      lexicon: new LexiconService(undefined, this.shipDB.db),
      trove: new TroveService(undefined, this.shipDB.db),
      settings: new SettingsService(this.serviceOptions, this.shipDB.db),
    };
  }

  public async init(authService: AuthService) {
    this.authService = authService;
    this.initSpaces();
    this.initChat();
    this.initBedrock();
    this.initLexicon();
  }

  private async initSpaces() {
    await this.services?.bazaar.init();
    this.services?.spaces.init();
  }

  private async initChat() {
    await this.services?.chat.init();
    this.services?.notifications.init();
  }

  private async initBedrock() {
    await this.services?.bedrock.init();
  }

  private async initLexicon() {
    await this.services?.lexicon.init();
  }

  public async getOurPassport() {
    return await this.services?.friends.fetchOne(this.patp);
  }

  public updateCookie(cookie: string) {
    if (!this.credentials) return;

    this.shipDB?.setCredentials(
      this.credentials.url,
      this.credentials.code,
      cookie
    );
  }

  public setCredentials(url: string, code: string, cookie: string) {
    this.shipDB?.setCredentials(url, code, cookie);
  }

  get credentials(): Credentials | undefined {
    if (!this.shipDB) {
      log.warn('ship.service.ts:', 'No ship database found');
      return undefined;
    }

    return this.shipDB.getCredentials();
  }

  public getServerCode(): string | undefined {
    if (!this.shipDB) {
      log.warn('ship.service.ts:', 'No ship database found');
      return undefined;
    }

    return this.shipDB.getCredentials().code;
  }

  public decryptDb(password: string) {
    if (!this.shipDB) return;

    log.info('ship.service.ts:', 'Decrypting ship database...');

    this.shipDB.decrypt(password);
  }

  public encryptDb(password: string) {
    if (!this.shipDB) return;

    log.info('ship.service.ts:', 'Encrypting ship database...');

    this.shipDB.encrypt(password);
  }

  public async cleanupServices() {
    this.services?.chat.reset();
    this.services?.notifications.reset();
    this.services?.friends.reset();
    this.services?.spaces.reset();
    this.services?.bazaar.reset();
  }

  public async cleanup() {
    // remove all ipcMain listeners
    this.removeHandlers();
    this.cleanupServices();
    // if the ship is too slow, just skip closing the channel
    // so we dont hang the app for too long
    const timeout = setTimeout(() => {
      Promise.resolve();
      log.warn(
        'ship.service.ts, cleanup(): took too long to close channel, skipping'
      );
    }, 1000);
    await APIConnection.getInstance().closeChannel();
    clearTimeout(timeout);
    this.shipDB?.disconnect();
  }

  public async getOurGroups(): Promise<{ [path: string]: any }> {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'spaces',
      path: '/groups', // the spaces scry is at the root of the path
    });
    // return response.groups;
    return Array.from(Object.values(response.groups));
  }
  public async getGroup(path: string): Promise<{ [path: string]: any }> {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'spaces',
      path: `/groups${path}`, // the spaces scry is at the root of the path
    });
    return response;
    // return Array.from(Object.values(response.groups));
  }
  public async getGroupMembers(path: string): Promise<{ [path: string]: any }> {
    return await APIConnection.getInstance().conduit.scry({
      app: 'spaces',
      path: `/groups${path}/members`, // the spaces scry is at the root of the path
    });
    // return Array.from(Object.values(response.groups));
  }

  // ----------------------------------------
  // ------------------ S3 ------------------
  // ----------------------------------------
  public async getS3Bucket(): Promise<S3CredentialsAndConfig | null> {
    try {
      const credentials = await APIConnection.getInstance().conduit.scry({
        app: 'api-store',
        path: `/credentials`,
      });
      const configuration = await APIConnection.getInstance().conduit.scry({
        app: 'api-store',
        path: `/configuration`,
      });

      return { credentials, configuration };
    } catch {
      log.error('ship.service.ts: Failed to get S3 bucket.');

      return null;
    }
  }

  public async uploadFileAnon(
    args: FileUploadParams
  ): Promise<{ Location: string; key: string } | null> {
    return this.uploadFile(args, true);
  }

  public async uploadFile(
    args: FileUploadParams,
    withoutName?: boolean
  ): Promise<{ Location: string; key: string } | null> {
    try {
      const response = await this.getS3Bucket();
      if (!response) return null;

      // a little shim to handle people who accidentally included their bucket at the front of the credentials.endpoint
      let endp = response.credentials.endpoint;
      if (endp.split('.')[0] === response.configuration.currentBucket) {
        endp = endp.split('.').slice(1).join('.');
      }

      endp = endp.replace('https://', '');

      const client = new S3Client({
        endpoint: response.credentials.endpoint.includes('https://')
          ? response.credentials.endpoint
          : response.configuration.region === ''
          ? `https://${endp}`
          : undefined,
        credentials: response.credentials,
        region:
          response.configuration.region === ''
            ? 'us-east-1'
            : response.configuration.region,
      });

      let fileContent, fileName, fileExtension;
      if (args.source === 'file' && typeof args.content === 'string') {
        fileContent = fs.readFileSync(args.content);
        const fileParts = args.content.split('.');
        fileName = fileParts.slice(0, -1);
        // only take the filename, not the path
        fileName = fileName[0].split('/').pop();
        fileExtension = fileParts.pop();
      } else if (args.source === 'buffer') {
        fileContent = Buffer.from(args.content, 'base64');
        fileName = 'clipboard';
        fileExtension = args.contentType.split('/')[1];
      }
      if (!fileContent) log.warn('No file content found');
      const key = `${this.patp}/${moment().unix()}${
        withoutName ? '' : '-' + fileName
      }.${fileExtension}`;
      const params = {
        Bucket: response.configuration.currentBucket,
        Key: key,
        Body: fileContent as Buffer,
        ACL: StorageAcl.PublicRead,
        ContentType: args.contentType,
      };
      const uploadResponse = await client.upload(params).promise();
      if (uploadResponse['$metadata'].httpStatusCode === 200) {
        const Location = `https://${endp}/${params.Bucket}/${key}`;
        return { Location, key };
      } else {
        throw new Error();
      }
    } catch (err) {
      log.error('ship.service.ts: Failed to upload file.', err);

      return null;
    }
  }

  public async deleteFile(args: { key: string }): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.getS3Bucket()
        .then(async (response) => {
          console.log('getS3Bucket response: ', response);
          if (!response) return;
          // a little shim to handle people who accidentally included their bucket at the front of the credentials.endpoint
          let endp = response.credentials.endpoint;
          if (endp.split('.')[0] === response.configuration.currentBucket) {
            endp = endp.split('.').slice(1).join('.');
          }
          const client = new S3Client({
            credentials: response.credentials,
            endpoint: endp,
          });

          const params = {
            Bucket: response.configuration.currentBucket,
            Key: args.key,
          };
          const result = await client.delete(params).promise();
          resolve(result);
        })
        .catch(reject);
    });
  }

  getPassport() {
    if (!this.services) return;
    return this.services.friends.fetchOne(this.patp);
  }

  updatePassport(
    nickname: string,
    bio?: string,
    avatar?: string,
    color?: string,
    cover?: string
  ) {
    if (!this.services) return;

    return this.services.friends.saveContact(this.patp, {
      nickname,
      bio,
      avatar,
      color,
      cover,
    });
  }

  static _deleteShipDB(patp: string) {
    const dbPath = path.join(app.getPath('userData'), `${patp}.sqlite`);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  }
}

export default ShipService;

// Generate preload
export const shipPreload = ShipService.preload(
  new ShipService('', '', '', { preload: true })
);

export interface FileUploadParams {
  source: 'file' | 'buffer';
  // when source='file', content is filename; otherwise
  //   content should be clipboard contents
  content: string;
  contentType: string;
}
