import { S3Api } from './../../api/s3';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { onPatch, onSnapshot, getSnapshot } from 'mobx-state-tree';
import { S3Client, StorageAcl } from '../../s3/S3Client';
import moment from 'moment';
import { Realm } from '../../index';
import { BaseService } from '../base.service';
import { EncryptedStore } from '../../lib/encryptedStore';
import { ShipModelType, ShipModel, FileUploadParams } from './models/ship';
import { Patp } from '../../types';
import { AuthShipType } from '../identity/auth.model';
import { GroupsApi } from '../../api/groups';
import { RoomsService } from '../tray/rooms.service';
import { WalletService } from '../tray/wallet.service';
import { FriendsApi } from '../../api/friends';
import { FriendsStore, FriendsType } from './models/friends';
import { SlipService } from '../slip.service';
import { ChatStoreType } from './models/dms';
import { DiskStore } from '../base.store';

// upload support
const fs = require('fs');

export interface ShipModels {
  friends: FriendsType;
  chat?: ChatStoreType;
}

/**
 * ShipService
 */
export class ShipService extends BaseService {
  private db?: Store<ShipModelType> | EncryptedStore<ShipModelType>;
  private state?: ShipModelType;
  private models: ShipModels = {
    friends: FriendsStore.create({ all: {} }),
  };

  private readonly metadataStore: {
    graph: { [key: string]: any };
  } = {
    graph: {},
  };

  private readonly services: { slip?: SlipService } = {};
  rooms: RoomsService;
  wallet: WalletService;

  handlers = {
    'realm.ship.get-metadata': this.getMetadata,
    'realm.ship.get-contact': this.getContact,
    'realm.ship.save-my-contact': this.saveMyContact,
    'realm.ship.get-s3-bucket': this.getS3Bucket,
    'realm.ship.get-our-groups': this.getOurGroups,
    'realm.ship.get-friends': this.getFriends,
    'realm.ship.add-friend': this.addFriend,
    'realm.ship.edit-friend': this.editFriend,
    'realm.ship.remove-friend': this.removeFriend,
    'realm.ship.get-group': this.getGroup,
    'realm.ship.get-group-members': this.getGroupMembers,
    'realm.ship.upload-file': this.uploadFile,
  };

  static preload = {
    getApps: async () => {
      return await ipcRenderer.invoke('realm.ship.get-apps');
    },
    getOurGroups: async () => {
      return await ipcRenderer.invoke('realm.ship.get-our-groups');
    },
    getGroup: (path: string) => {
      return ipcRenderer.invoke('realm.ship.get-group', path);
    },
    getGroupMembers: (path: string) => {
      return ipcRenderer.invoke('realm.ship.get-group-members', path);
    },
    // getAppPreview: (ship: string, desk: string) => {
    //   return ipcRenderer.invoke('realm.ship.get-app-preview', ship, desk);
    // },
    getMetadata: async (path: string) => {
      return await ipcRenderer.invoke('realm.ship.get-metadata', path);
    },
    getS3Bucket: async () => {
      return await ipcRenderer.invoke('realm.ship.get-s3-bucket');
    },
    getContact: async (ship: string) => {
      return await ipcRenderer.invoke('realm.ship.get-contact', ship);
    },
    saveMyContact: async (profileData: any) => {
      return await ipcRenderer.invoke(
        'realm.ship.save-my-contact',
        profileData
      );
    },
    getFriends: async () => {
      return await ipcRenderer.invoke('realm.ship.get-friends');
    },
    addFriend: async (patp: Patp) =>
      await ipcRenderer.invoke('realm.ship.add-friend', patp),
    //
    editFriend: async (
      patp: Patp,
      payload: { pinned: boolean; tags: string[] }
    ) => await ipcRenderer.invoke('realm.ship.edit-friend', patp, payload),
    //
    removeFriend: async (patp: Patp) =>
      await ipcRenderer.invoke('realm.ship.remove-friend', patp),
    uploadFile: async (params: FileUploadParams) =>
      await ipcRenderer.invoke('realm.ship.upload-file', params),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    this.subscribe = this.subscribe.bind(this);
    this.services.slip = new SlipService(core);
    this.rooms = new RoomsService(core);
    this.wallet = new WalletService(core);
  }

  get modelSnapshots() {
    return {
      friends: this.models.friends ? getSnapshot(this.models.friends) : null,
    };
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async subscribe(ship: string, shipInfo: any) {
    let secretKey: string | null = this.core.passwords.getPassword(
      ship
    ) as string;
    const storeParams = {
      name: 'ship',
      cwd: `realm.${ship}`,
      secretKey,
      accessPropertiesByDotNotation: true,
    };
    // this.db =
    //   process.env.NODE_ENV === 'development'
    //     ? new Store<ShipModelType>(storeParams)
    //     : new EncryptedStore<ShipModelType>(storeParams);
    this.db = new Store(storeParams);

    const persistedState: ShipModelType = this.db.store;

    // TODO set up multiple ships properly
    this.state = ShipModel.create({
      patp: ship,
      url: persistedState.url || shipInfo.url,
      color: persistedState.color || null,
      nickname: persistedState.nickname || null,
      avatar: persistedState.avatar || null,
      loggedIn: true,
      loader: { state: 'initial' },
    });
    this.state.loader.set('loading');

    const friendsStore = new DiskStore(
      'friends',
      ship,
      secretKey,
      FriendsStore,
      { all: {} }
    );
    this.models.friends = friendsStore.model;

    secretKey = null;
    friendsStore.registerPatches(this.core.onEffect);

    this.core.services.desktop.load(ship, this.state.color || '#4E9EFD');

    onSnapshot(this.state, (snapshot: any) => {
      if (this.db) {
        this.db.store = snapshot;
      }
    });
    // 1. Send initial snapshot
    const syncEffect = {
      model: getSnapshot(this.state),
      resource: 'ship',
      key: ship,
      response: 'initial',
    };
    // console.log(syncEffect);
    this.core.onEffect(syncEffect);

    try {
      if (!this.core.conduit) throw new Error('No conduit found');
      FriendsApi.watchFriends(this.core.conduit, this.models.friends);

      FriendsApi.getContact(this.core.conduit, ship).then((value: any) => {
        this.state?.setOurMetadata(value);
      });
      this.state.loader.set('loaded');

      this.rooms?.watch();
      this.wallet?.onLogin(ship);

      // return ship state
    } catch (err) {
      this.core.sendLog(`error in ship try ${err}`);
      console.error(err);
    }
    // 2. Register patches
    onPatch(this.state, (patch) => {
      // send patches to UI store
      const patchEffect = {
        patch,
        resource: 'ship',
        key: ship,
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    return { ship: this.state, models: this.modelSnapshots };
  }

  get walletSnapshot() {
    return this.wallet?.snapshot;
  }

  async init(ship: string) {
    if (!this.state) throw new Error('No state found');
    const syncEffect = {
      model: getSnapshot(this.state),
      resource: 'ship',
      key: ship,
      response: 'initial',
    };
    this.core.onEffect(syncEffect);
  }

  logout() {
    this.db = undefined;
    this.state = undefined;
    this.models.chat = undefined;
    this.core.mainWindow.webContents.send('realm.on-logout');
    this.wallet.logout();
  }

  storeNewShip(ship: AuthShipType): ShipModelType {
    const newShip = ShipModel.create({
      patp: ship.patp,
      url: ship.url,
      color: ship.color || null,
      nickname: ship.nickname || null,
      avatar: ship.avatar || null,
    });

    const storeParams = {
      name: 'ship',
      cwd: `realm.${ship.patp}`,
      secretKey: this.core.passwords.getPassword(ship.patp),
      accessPropertiesByDotNotation: true,
    };

    // TODO this should use DiskStore and be encrypted
    this.db = new Store<ShipModelType>(storeParams);

    // this.db =
    // process.env.NODE_ENV === 'development'
    //   ? new Store<ShipModelType>(storeParams)
    //   : new EncryptedStore<ShipModelType>(storeParams);

    this.db.store = newShip;
    return newShip;
  }

  removeShip(_patp: string) {
    // TODO clean out the folder here.
    // const deletedShip = new Store<ShipModelType>({
    //   name: 'ship',
    //   cwd: `realm.${patp}`,
    //   accessPropertiesByDotNotation: true,
    // });
    // deletedShip.clear();
    // this.db?.clear();
  }

  async getOurGroups(_event: any): Promise<any> {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await GroupsApi.getOur(this.core.conduit);
  }
  async getGroup(_event: any, path: string): Promise<any> {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await GroupsApi.getGroup(this.core.conduit, path);
  }
  async getGroupMembers(_event: any, path: string): Promise<any> {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await GroupsApi.getGroupMembers(this.core.conduit, path);
  }

  // ------------------------------------------
  // ------------ Action handlers -------------
  // ------------------------------------------
  //
  async getFriends(_event: IpcMainInvokeEvent) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await FriendsApi.getFriends(this.core.conduit);
  }

  //
  async addFriend(_event: IpcMainInvokeEvent, patp: Patp) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await FriendsApi.addFriend(this.core.conduit, patp);
  }

  //
  async editFriend(
    _event: IpcMainInvokeEvent,
    patp: Patp,
    payload: { pinned: boolean; tags: string[] }
  ) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await FriendsApi.editFriend(this.core.conduit, patp, payload);
  }

  async removeFriend(_event: IpcMainInvokeEvent, patp: Patp) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await FriendsApi.removeFriend(this.core.conduit, patp);
  }

  // ---
  getContact(_event: any, ship: string): any {
    const patp = ship.includes('~') ? ship : `~${ship}`;
    const contact = this.models.friends?.getContactAvatarMetadata(patp);
    return contact;
  }

  //
  async saveMyContact(_event: IpcMainInvokeEvent, profileData: any) {
    if (!this.core.conduit) throw new Error('No conduit found');
    await FriendsApi.saveContact(
      this.core.conduit,
      profileData.patp || this.state?.patp,
      profileData
    );

    this.state?.setOurMetadata(profileData);
  }

  getMetadata(_event: any, path: string): any {
    return this.metadataStore.graph[path];
  }

  async getS3Bucket(_event: any = undefined) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const [credentials, configuration] = await Promise.all([
      S3Api.getCredentials(this.core.conduit),
      S3Api.getConfiguration(this.core.conduit),
    ]);

    return {
      ...credentials,
      ...configuration,
    };
  }

  async uploadFile(
    _event: any,
    args: FileUploadParams
  ): Promise<string | undefined> {
    // const args = params;
    return await new Promise((resolve, reject) => {
      // console.log('ShipActions.uploadFile - getting S3 bucket...');
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
          const params = {
            Bucket: response.configuration.currentBucket,
            Key: `${
              this.state?.patp
            }/${moment().unix()}-${fileName}.${fileExtension}`,
            Body: fileContent,
            ACL: StorageAcl.PublicRead,
            ContentType: args.contentType,
          };
          // console.log('uploading file => %o', params);
          const { Location } = await client.upload(params).promise();
          // console.log('Location => %o', Location);
          resolve(Location);
        })
        .catch(reject);
    });
  }
}
