import { app } from 'electron';
import fs from 'fs';
import log from 'electron-log';
import moment from 'moment';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { ShipDB } from './ship.db';
import APIConnection, { ConduitSession } from '../conduit';
import RoomsService from './rooms.service';
import NotificationsService from './notifications/notifications.service';
import ChatService from './chat/chat.service';
import { Friends } from './friends.table';
import SpacesService from './spaces/spaces.service';
import { S3Client, StorageAcl } from '../../../renderer/lib/S3Client';
import BazaarService from './spaces/bazaar.service';
import WalletService from './wallet/wallet.service';

export class ShipService extends AbstractService {
  private patp: string;
  private readonly shipDB?: ShipDB;
  services?: {
    rooms: RoomsService;
    notifications: NotificationsService;
    chat: ChatService;
    friends: Friends;
    spaces: SpacesService;
    bazaar: BazaarService;
    wallet: WalletService;
  };

  constructor(patp: string, password: string, options?: ServiceOptions) {
    super('shipService', options);
    this.patp = patp;
    if (options?.preload) {
      return;
    }
    this.shipDB = new ShipDB(this.patp, password);
    // const credentials = this.shipDB.getCredentials();
    const credentials = {
      ship: '~dopmer-fopryg-novned-tidsyl',
      url: 'http://127.0.0.1',
      cookie:
        'urbauth-~dopmer-fopryg-novned-tidsyl=0v4.ts57d.tpntn.44g8h.d5qvs.g04vl; Path=/; Max-Age=604800',
      code: 'timtun-noprec-witsun-tadrys',
    };
    this.shipDB?.setCredentials(
      credentials.url,
      credentials.code,
      credentials.cookie
    );
    if (
      !this.shipDB ||
      !credentials.code ||
      !credentials.url ||
      !credentials.cookie
    ) {
      log.info(`No credentials found for ${patp}`);
      return;
    }

    // create an instance of the conduit
    APIConnection.getInstance(credentials).conduit.on(
      'refreshed',
      (session: ConduitSession) => {
        this.shipDB?.setCredentials(session.url, session.code, session.cookie);
      }
    );

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
      wallet: new WalletService(undefined, this.shipDB.db),
    };

    app.on('quit', () => {
      this.shipDB?.disconnect();
      APIConnection.getInstance(credentials).conduit.removeAllListeners();
    });
  }

  // TODO initialize the ship services here
  public init() {
    this.services?.spaces.init();
  }

  public updateCookie(cookie: string) {
    this.shipDB?.setCredentials(
      this.credentials.url,
      this.credentials.code,
      cookie
    );
  }

  get credentials() {
    return this.shipDB?.getCredentials();
  }

  private _decryptDb(password: string) {
    this.shipDB?.decrypt(password);
  }

  public cleanup() {
    // remove all ipcMain listeners
    this.reset();
    this.services?.chat.reset();
    this.services?.rooms.reset();
    this.services?.notifications.reset();
    this.services?.friends.reset();
    this.services?.spaces.reset();
    this.services?.bazaar.reset();
    this.services?.wallet.reset();
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
          console.log(response);
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
}

export default ShipService;

// Generate preload
export const shipPreload = ShipService.preload(
  new ShipService('', '', { preload: true })
);

export interface FileUploadParams {
  source: 'file' | 'buffer';
  // when source='file', content is filename; otherwise
  //   content should be clipboard contents
  content: string;
  contentType: string;
}
