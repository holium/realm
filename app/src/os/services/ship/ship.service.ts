import { S3Api } from './../../api/s3';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { onPatch, onSnapshot, getSnapshot } from 'mobx-state-tree';
import { Content } from '@urbit/api';
import { S3Client, StorageAcl } from '../../s3/S3Client';
import moment from 'moment';
import { Realm } from '../../index';
import { BaseService } from '../base.service';
import { EncryptedStore } from '../../lib/encryptedStore';
import { ShipModelType, ShipModel, FileUploadParams } from './models/ship';
import { Patp } from '../../types';
import { DmApi } from '../../api/dms';
import { MetadataApi } from '../../api/metadata';
import { AuthShipType } from '../identity/auth.model';
import { GroupsApi } from '../../api/groups';
import { RoomsService } from '../tray/rooms.service';
import { WalletService } from '../tray/wallet.service';
import { FriendsApi } from '../../api/friends';
import { FriendsStore, FriendsType } from './models/friends';
import { SlipService } from '../slip.service';
import { ChatStoreType } from './models/dms';
import { CourierApi } from '../../api/courier';
import {
  CourierStore,
  CourierStoreType,
  DMLogType,
  PreviewGroupDMType,
} from './models/courier';
import { toJS } from 'mobx';
import { DiskStore } from '../base.store';

// upload support
const fs = require('fs');

export interface ShipModels {
  friends: FriendsType;
  chat?: ChatStoreType;
  courier?: CourierStoreType;
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
    'realm.ship.get-dms': this.getDMs,
    'realm.ship.get-dm-log': this.getDmLog,
    'realm.ship.send-dm': this.sendDm,
    'realm.ship.get-metadata': this.getMetadata,
    'realm.ship.get-contact': this.getContact,
    'realm.ship.save-my-contact': this.saveMyContact,
    'realm.ship.draft-dm': this.draftNewDm,
    'realm.ship.accept-dm-request': this.acceptDm,
    'realm.ship.decline-dm-request': this.declineDm,
    'realm.ship.accept-group-dm-request': this.acceptGroupDm,
    'realm.ship.decline-group-dm-request': this.declineGroupDm,
    'realm.ship.get-s3-bucket': this.getS3Bucket,
    // 'realm.ship.get-app-preview': this.getAppPreview,
    'realm.ship.get-our-groups': this.getOurGroups,
    'realm.ship.get-friends': this.getFriends,
    'realm.ship.add-friend': this.addFriend,
    'realm.ship.edit-friend': this.editFriend,
    'realm.ship.remove-friend': this.removeFriend,
    'realm.ship.read-dm': this.readDm,
    'realm.ship.read-group-dm': this.readGroupDm,
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
    getDMs: async () => {
      return await ipcRenderer.invoke('realm.ship.get-dms');
    },
    getDmLog: async (path: string): Promise<DMLogType> => {
      return await ipcRenderer.invoke('realm.ship.get-dm-log', path);
    },
    acceptDm: async (toShip: string) => {
      return await ipcRenderer.invoke('realm.ship.accept-dm-request', toShip);
    },
    declineDm: async (toShip: string) => {
      return await ipcRenderer.invoke('realm.ship.decline-dm-request', toShip);
    },
    acceptGroupDm: async (path: string) => {
      return await ipcRenderer.invoke(
        'realm.ship.accept-group-dm-request',
        path
      );
    },
    declineGroupDm: async (path: string) => {
      return await ipcRenderer.invoke(
        'realm.ship.decline-group-dm-request',
        path
      );
    },
    setScreen: async (screen: boolean) => {
      return await ipcRenderer.invoke('realm.ship.set-dm-screen', screen);
    },
    sendDm: async (path: string, contents: Content[]) => {
      return await ipcRenderer.invoke('realm.ship.send-dm', path, contents);
    },
    draftDm: async (patps: Patp[], metadata: any[]) => {
      return await ipcRenderer.invoke('realm.ship.draft-dm', patps, metadata);
    },
    removeDm: async (ship: string, index: any) => {
      return await ipcRenderer.invoke('realm.ship.remove-dm', ship, index);
    },
    readDm: async (ship: Patp) =>
      await ipcRenderer.invoke('realm.ship.read-dm', ship),
    readGroupDm: async (path: string) =>
      await ipcRenderer.invoke('realm.ship.read-group-dm', path),
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
      courier: this.models.courier ? getSnapshot(this.models.courier) : null,
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
      wallpaper: persistedState.wallpaper || null,
      color: persistedState.color || null,
      nickname: persistedState.nickname || null,
      avatar: persistedState.avatar || null,
      loggedIn: true,
      loader: { state: 'initial' },
    });
    this.state.loader.set('loading');

    const courierStore = new DiskStore(
      'courier',
      ship,
      secretKey,
      CourierStore
    );
    this.models.courier = courierStore.model;
    const friendsStore = new DiskStore(
      'friends',
      ship,
      secretKey,
      FriendsStore,
      { all: {} }
    );
    this.models.friends = friendsStore.model;

    secretKey = null;
    courierStore.registerPatches(this.core.onEffect);
    friendsStore.registerPatches(this.core.onEffect);

    this.core.services.desktop.load(ship, this.state.color || '#4E9EFD');
    this.core.services.composer.load(ship);

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
      /*
      // TODO rewrite the contact store logic
      try {
        this.core.conduit.watch({
          app: 'contact-store',
          path: '/all',
          onEvent: (data: any) => {
            this.models.friends.setInitial(data);
          },
          onError: () => console.log('Subscription rejected'),
          onQuit: () => console.log('Kicked from subscription'),
        });
      } catch {
        console.log('Subscription failed');
      }*/

      if (!this.core.conduit) throw new Error('No conduit found');
      FriendsApi.watchFriends(this.core.conduit, this.models.friends);

      FriendsApi.getContact(this.core.conduit, ship).then((value: any) => {
        this.state?.setOurMetadata(value);
      });

      MetadataApi.syncGraphMetadata(this.core.conduit, this.metadataStore);

      // register dm update handler
      if (!this.models.courier) throw new Error('No courier found');
      DmApi.updates(this.core.conduit, this.models.courier);
      CourierApi.dmUpdates(this.core.conduit, this.models.courier);
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
    this.models.courier = undefined;
    this.core.mainWindow.webContents.send('realm.on-logout');
    this.wallet.logout();
  }

  storeNewShip(ship: AuthShipType): ShipModelType {
    const newShip = ShipModel.create({
      patp: ship.patp,
      url: ship.url,
      wallpaper: ship.wallpaper || null,
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

  // async getAppPreview(_event: any, ship: string, desk: string): Promise<any> {
  //   return await DocketApi.requestTreaty(
  //     ship,
  //     desk,
  //     this.models.bazaar,
  //     this.core.conduit,
  //     this.metadataStore
  //   );
  // }

  async getDMs() {
    if (!this.core.conduit) {
      return;
    }
    return await CourierApi.getDmList(this.core.conduit);
  }

  async getDmLog(_event: any, ship: Patp) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const dmLog = await CourierApi.getDmLog(this.core.conduit, ship);
    this.models.courier?.setDmLog(dmLog);
    return dmLog;
  }

  async acceptDm(_event: any, toShip: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await CourierApi.acceptDm(this.core.conduit, toShip);
  }

  async declineDm(_event: any, toShip: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await CourierApi.declineDm(this.core.conduit, toShip);
  }

  /**
   * Sets the unread count of a dm inbox to 0
   *
   * @param _event
   * @param toShip
   * @returns
   */
  async readDm(_event: any, toShip: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    CourierApi.readDm(this.core.conduit, toShip);
  }

  /**
   * Sets the unread count of a group dm channel to 0
   *
   * @param _event
   * @param path
   * @returns
   */
  async readGroupDm(_event: any, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const split = path.split('/');
    const host = split[0];
    const timestamp = split[1];
    return await CourierApi.readGroupDm(this.core.conduit, host, timestamp);
  }

  async acceptGroupDm(_event: any, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const inviteId = this.models.courier?.previews.get(path)?.inviteId;
    console.log('acceptingDM', path, inviteId);
    if (inviteId) {
      return await CourierApi.acceptGroupDm(this.core.conduit, inviteId);
    }
  }

  async declineGroupDm(_event: any, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const inviteId = this.models.courier?.previews.get(path)?.inviteId;
    console.log('rejectingDM', path, inviteId);
    if (inviteId) {
      await CourierApi.declineGroupDm(this.core.conduit, inviteId);
      return this.models.courier?.declineDm(path);
    }
  }

  async draftNewDm(_event: any, patps: Patp[], metadata: any[]) {
    if (!this.core.conduit) throw new Error('No conduit found');
    let draft;
    if (patps.length > 1) {
      const reaction: any = await CourierApi.createGroupDm(
        this.core.conduit,
        patps
      );
      draft = this.models.courier?.draftGroupDm(
        reaction['group-dm-created'] as PreviewGroupDMType
      );
    } else {
      // single dm
      draft = this.models.courier?.draftDm(patps, metadata);
    }
    return toJS(draft);
  }

  async sendDm(_event: any, path: string, contents: Content[]) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const dmLog = this.models.courier?.dms.get(path);
    if (!dmLog) throw new Error('DM log not found, check path');
    if (!this.state?.patp) throw new Error('No patp found');

    return dmLog.sendDm(this.core.conduit, this.state.patp, path, contents);
  }

  async removeDm(_event: any, toShip: string, removeIndex: any) {
    const ourShip = this.state?.patp;
    console.log('removingDM', ourShip, toShip, removeIndex);
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
          const client = new S3Client({
            credentials: response.credentials,
            endpoint: response.credentials.endpoint,
            signatureVersion: 'v4',
          });
          let fileContent, fileName, fileExtension;
          if (args.source === 'file' && typeof args.content === 'string') {
            fileContent = fs.readFileSync(args.content);
            // console.log(fileContent);
            const fileParts = args.content.split('.');
            fileName = fileParts.slice(0, -1);
            fileExtension = fileParts.pop();
          } else if (args.source === 'buffer') {
            fileContent = await Buffer.from(args.content, 'base64');
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
