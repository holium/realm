import { app } from 'electron';
import fs from 'fs';
import log from 'electron-log';
import moment from 'moment';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { ShipDB } from './ship.db';
import { APIConnection, ConduitSession } from '../api';
import RoomsService from './rooms.service';
import NotificationsService from './notifications/notifications.service';
import ChatService from './chat/chat.service';
import { Friends } from './friends.service';
import SpacesService from './spaces/spaces.service';
import { S3Client, StorageAcl } from '../../../renderer/lib/S3Client';
import BazaarService from './spaces/bazaar.service';
import { getCookie } from '../../lib/shipHelpers';

export class ShipService extends AbstractService<any> {
  public patp: string;
  private shipDB?: ShipDB;
  services?: {
    rooms: RoomsService;
    notifications: NotificationsService;
    chat: ChatService;
    friends: Friends;
    spaces: SpacesService;
    bazaar: BazaarService;
  };

  constructor(
    ship: {
      patp: string;
      url: string;
      code: string;
    },
    encryptionKey: string,
    options?: ServiceOptions
  ) {
    super('shipService', options);
    this.patp = ship.patp;
    if (options?.preload) return;

    this.shipDB = new ShipDB(this.patp, encryptionKey);

    if (!this.shipDB) {
      log.info(
        'ship.service.ts:',
        `Failed to create ship database for ${ship.patp}`
      );
      return;
    }

    log.info(
      'ship.service.ts:',
      `Created ship database for ${ship.patp} with encryption key`,
      encryptionKey
    );

    const credentials = this.shipDB.getCredentials();

    log.info('ship.service.ts:', 'Creating new ship credentials...');

    if (!credentials.cookie) {
      log.info('ship.service.ts:', 'No cookie found, getting cookie...');
      getCookie({
        patp: ship.patp,
        url: ship.url,
        code: ship.code,
      })
        .then((cookie) => {
          if (cookie) {
            this.setCredentials(ship.url, ship.code, ship.code);
          } else {
            log.error('ship.service.ts:', 'Failed to get cookie');
          }
        })
        .catch((err) => {
          log.error('ship.service.ts:', 'Failed to get cookie', err);
        });
    } else {
      log.info('ship.service.ts:', 'Cookie found, setting credentials...');
      this.setCredentials(ship.url, ship.code, credentials.cookie);
    }

    // create an instance of the conduit
    APIConnection.getInstance({
      ...credentials,
      ship: ship.patp,
    }).conduit.on('refreshed', (session: ConduitSession) => {
      this.shipDB?.setCredentials(session.url, session.code, session.cookie);
    });

    // TODO this DROP is here until we get the agent refactor with lastTimestamp scries
    try {
      this.shipDB.db.exec(`
        DELETE FROM app_docks;
        DELETE FROM app_recommendations;
        DELETE FROM app_catalog;
        DELETE FROM spaces_stalls;
        DELETE FROM spaces_members;
        DELETE FROM spaces;
      `);
    } catch (e) {
      log.error(e);
    }

    this.services = {
      rooms: new RoomsService(),
      notifications: new NotificationsService(undefined, this.shipDB.db),
      chat: new ChatService(undefined, this.shipDB.db),
      friends: new Friends(false, this.shipDB.db),
      spaces: new SpacesService(undefined, this.shipDB.db, this.patp),
      bazaar: new BazaarService(undefined, this.shipDB.db),
    };

    app.on('quit', () => {
      this.shipDB?.disconnect();
    });
  }

  // TODO initialize the ship services here
  public init() {
    this.services?.spaces.init();
    this.services?.bazaar.init();
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

  get credentials() {
    return this.shipDB?.getCredentials();
  }

  private _decryptDb(password: string) {
    this.shipDB?.decrypt(password);
  }

  public cleanup() {
    // remove all ipcMain listeners
    this.removeHandlers();
    this.services?.chat.reset();
    this.services?.rooms.removeHandlers();
    this.services?.notifications.reset();
    this.services?.friends.reset();
    this.services?.spaces.reset();
    this.services?.bazaar.reset();
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
  public async getS3Bucket(session?: ConduitSession) {
    const [credentials, configuration] = await Promise.all([
      APIConnection.getInstance(session).conduit.scry({
        app: 's3-store',
        path: `/credentials`,
      }),
      APIConnection.getInstance(session).conduit.scry({
        app: 's3-store',
        path: `/configuration`,
      }),
    ]);

    return {
      ...credentials['s3-update'],
      ...configuration['s3-update'],
    };
  }

  public async uploadFile(
    args: FileUploadParams,
    session?: ConduitSession
  ): Promise<string | undefined> {
    return await new Promise((resolve, reject) => {
      this.getS3Bucket(session)
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

  updatePassport(nickname: string, description: string, avatar: string) {
    if (!this.services) return;

    this.services.friends.saveContact(this.patp, {
      nickname,
      bio: description,
      avatar,
    });
  }
}

export default ShipService;

// Generate preload
export const shipPreload = ShipService.preload(
  new ShipService(
    {
      patp: '',
      url: '',
      code: '',
    },
    '',
    { preload: true }
  )
);

export interface FileUploadParams {
  source: 'file' | 'buffer';
  // when source='file', content is filename; otherwise
  //   content should be clipboard contents
  content: string;
  contentType: string;
}
