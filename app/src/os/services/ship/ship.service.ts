import { app } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { reject } from 'lodash';
import moment from 'moment';
import path from 'path';

import { S3Client, StorageAcl } from '../../../renderer/lib/S3Client';
import { getCookie } from '../../lib/shipHelpers';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection, ConduitSession } from '../api';
import AuthService from '../auth/auth.service';
import ChatService from './chat/chat.service';
import { FriendsService } from './friends.service';
import NotificationsService from './notifications/notifications.service';
import { SettingsService } from './settings.service';
import { ShipDB } from './ship.db';
import { Credentials } from './ship.types.ts';
import BazaarService from './spaces/bazaar.service';
import SpacesService from './spaces/spaces.service';
import WalletService from './wallet/wallet.service';

export class ShipService extends AbstractService<any> {
  public patp: string;
  private shipDB?: ShipDB;
  private serviceOptions: ServiceOptions = { preload: false, verbose: false };
  private authService: AuthService | null = null;
  services?: {
    notifications: NotificationsService;
    chat: ChatService;
    friends: FriendsService;
    spaces: SpacesService;
    bazaar: BazaarService;
    wallet: WalletService;
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
    this.shipDB = new ShipDB(patp, password, clientSideEncryptionKey);
    // this.encryptDb(password);
    if (options?.verbose) {
      log.info(
        'ship.service.ts:',
        `Created ship database for ${patp} with client-side encryption key`,
        clientSideEncryptionKey
      );
    }

    const credentials = this.shipDB.getCredentials();
    if (!credentials.cookie) {
      if (options?.verbose) {
        log.info('ship.service.ts:', 'No cookie found, getting cookie...');
      }
      getCookie({
        serverUrl: credentials.url,
        serverCode: credentials.code,
      })
        .then((cookie) => {
          if (cookie) {
            if (options?.verbose) {
              log.info(
                'ship.service.ts:',
                'Got cookie, setting credentials...'
              );
            }
            this.setCredentials(credentials.url, credentials.code, cookie);
            this._openConduit({ ...credentials, patp, cookie });
            this._registerServices();
          } else {
            log.error('ship.service.ts:', 'Failed to get cookie');
          }
        })
        .catch((err) => {
          log.error('ship.service.ts:', 'Failed to get cookie', err);
        });
    } else {
      this._openConduit(credentials);
      this._registerServices();
    }

    app.on('quit', () => {
      this.shipDB?.disconnect();
    });
  }

  _openConduit(credentials: any) {
    return new Promise((resolve) =>
      APIConnection.getInstance({
        ...credentials,
        ship: this.patp,
      })
        .conduit.on('connected', () => {
          resolve(null);
        })
        .on('failed', () => {
          // log.info('ship.service.ts:', 'Conduit failed');
          this.shipDB?.setCredentials(credentials.url, credentials.code, null);
          this.authService?._setLockfile({ ...credentials, cookie: null });
          APIConnection.getInstance().closeChannel();
          // this will actually automatically reconnect
          //  (and it works as of last testing)
          // APIConnection.getInstance().reconnect();
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
        })
    );
  }

  private _registerServices() {
    if (!this.shipDB) return;
    log.info(
      'ship.service.ts:',
      'Creating ship sub-services (rooms, notifications, chat, friends, spaces, bazaar)...'
    );
    this.services = {
      chat: new ChatService(this.serviceOptions, this.shipDB.db),
      notifications: new NotificationsService(
        this.serviceOptions,
        this.shipDB.db
      ),
      bazaar: new BazaarService(this.serviceOptions, this.shipDB.db),
      spaces: new SpacesService(this.serviceOptions, this.shipDB.db, this.patp),
      friends: new FriendsService(this.serviceOptions, this.shipDB.db),
      wallet: new WalletService(undefined, this.shipDB.db),
      settings: new SettingsService(this.serviceOptions, this.shipDB.db),
    };
  }

  public async init(authService: AuthService) {
    this.authService = authService;
    this.initSpaces();
    this.initChat();
  }

  private async initSpaces() {
    await this.services?.bazaar.init();
    this.services?.spaces.init();
  }

  private async initChat() {
    await this.services?.chat.init();
    this.services?.notifications.init();
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

  public async cleanup() {
    // remove all ipcMain listeners
    this.removeHandlers();
    this.services?.chat.reset();
    this.services?.notifications.reset();
    this.services?.friends.reset();
    this.services?.spaces.reset();
    this.services?.bazaar.reset();
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
  public async getS3Bucket() {
    const [credentials, configuration] = await Promise.all([
      APIConnection.getInstance().conduit.scry({
        app: 's3-store',
        path: `/credentials`,
      }),
      APIConnection.getInstance().conduit.scry({
        app: 's3-store',
        path: `/configuration`,
      }),
    ]);

    return {
      ...credentials['s3-update'],
      ...configuration['s3-update'],
    };
  }

  public async uploadFile(args: FileUploadParams): Promise<string | undefined> {
    return await new Promise((resolve, reject) => {
      this.getS3Bucket()
        .then(async (response: any) => {
          console.log('getS3Bucket response: ', response);
          // a little shim to handle people who accidentally included their bucket at the front of the credentials.endpoint
          let endp = response.credentials.endpoint;
          if (endp.split('.')[0] === response.configuration.currentBucket) {
            endp = endp.split('.').slice(1).join('.');
          }
          const client = new S3Client({
            credentials: response.credentials,
            endpoint: endp,
            signatureVersion: 'v4',
          });
          let fileContent, fileName, fileExtension;
          if (args.source === 'file' && typeof args.content === 'string') {
            fileContent = fs.readFileSync(args.content);
            // console.log(fileContent);
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
          const params = {
            Bucket: response.configuration.currentBucket,
            Key: `${this.patp}/${moment().unix()}-${fileName}.${fileExtension}`,
            Body: fileContent as Buffer,
            ACL: StorageAcl.PublicRead,
            ContentType: args.contentType,
          };
          const { Location } = await client.upload(params).promise();
          resolve(Location);
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
