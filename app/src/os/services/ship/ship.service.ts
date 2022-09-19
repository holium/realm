import { S3Api } from './../../api/s3';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { onPatch, onSnapshot, getSnapshot } from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import EncryptedStore from './encryptedStore';
import { ShipModelType, ShipModel } from './models/ship';
import { MSTAction, Patp } from '../../types';
import { ContactApi } from '../../api/contacts';
import { DmApi } from '../../api/dms';
import { DocketApi } from '../../api/docket';
import { MetadataApi } from '../../api/metadata';
import { AuthShipType } from '../identity/auth.model';
import { GroupsApi } from '../../api/groups';
import { RoomsService } from '../tray/rooms.service';
import { WalletService } from '../tray/wallet.service';
import { FriendsApi } from '../../api/friends';
import { FriendsStore, FriendsType } from './models/friends';
import { SlipService } from '../slip.service';
import { ContactStore, ContactStoreType } from './models/contacts';
import { DocketStore, DocketStoreType } from './models/docket';
import { ChatStoreType, ChatStore } from './models/dms';
import { loadDMsFromDisk } from './stores/dms';
import { loadCourierFromDisk } from './stores/courier';
import { loadContactsFromDisk } from './stores/contacts';
import { loadDocketFromDisk } from './stores/docket';
import { loadFriendsFromDisk } from './stores/friends';
import { loadNotificationsFromDisk } from './stores/notifications';
import { CourierApi } from '../../api/courier';
import { CourierStoreType, PreviewGroupDMType } from './models/courier';
import { toJS } from 'mobx';
import {
  NotificationStore,
  NotificationStoreType,
} from './models/notifications';
import { NotificationApi } from '../../api/notifications';

export type ShipModels = {
  friends: FriendsType;
  contacts?: ContactStoreType;
  docket: DocketStoreType;
  chat?: ChatStoreType;
  courier?: CourierStoreType;
  notifications: NotificationStoreType;
};

/**
 * ShipService
 */
export class ShipService extends BaseService {
  private db?: Store<ShipModelType> | EncryptedStore<ShipModelType>;
  private state?: ShipModelType;
  private models: ShipModels = {
    friends: FriendsStore.create({ all: {} }),
    contacts: undefined,
    docket: DocketStore.create({ apps: {} }),
    chat: undefined,
    notifications: NotificationStore.create({
      unseen: [],
      seen: [],
      all: [],
      recent: [],
    }),
  };
  private metadataStore: {
    graph: { [key: string]: any };
  } = {
    graph: {},
  };
  private services: { slip?: SlipService } = {};
  rooms: RoomsService;
  wallet: WalletService;

  handlers = {
    'realm.ship.get-dms': this.getDMs,
    'realm.ship.get-dm-log': this.getDMLog,
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
    'realm.ship.get-app-preview': this.getAppPreview,
    'realm.ship.get-our-groups': this.getOurGroups,
    'realm.ship.get-friends': this.getFriends,
    'realm.ship.add-friend': this.addFriend,
    'realm.ship.edit-friend': this.editFriend,
    'realm.ship.remove-friend': this.removeFriend,
    'realm.ship.get-notifications': this.getNotifications,
    'realm.ship.opened-notifications': this.openedNotifications,
    'realm.ship.read-dm': this.readDm,
    'realm.ship.read-group-dm': this.readGroupDm,
  };

  static preload = {
    getApps: () => {
      return ipcRenderer.invoke('realm.ship.get-apps');
    },
    getOurGroups: () => {
      return ipcRenderer.invoke('realm.ship.get-our-groups');
    },
    getAppPreview: (ship: string, desk: string) => {
      return ipcRenderer.invoke('realm.ship.get-app-preview', ship, desk);
    },
    getMetadata: (path: string) => {
      return ipcRenderer.invoke('realm.ship.get-metadata', path);
    },
    getS3Bucket: () => {
      return ipcRenderer.invoke('realm.ship.get-s3-bucket');
    },
    getContact: (ship: string) => {
      return ipcRenderer.invoke('realm.ship.get-contact', ship);
    },
    saveMyContact: (profileData: any) => {
      return ipcRenderer.invoke('realm.ship.save-my-contact', profileData);
    },
    getDMs: () => {
      return ipcRenderer.invoke('realm.ship.get-dms');
    },
    getDMLog: (toShip: string) => {
      return ipcRenderer.invoke('realm.ship.get-dm-log', toShip);
    },
    acceptDm: (toShip: string) => {
      return ipcRenderer.invoke('realm.ship.accept-dm-request', toShip);
    },
    declineDm: (toShip: string) => {
      return ipcRenderer.invoke('realm.ship.decline-dm-request', toShip);
    },
    acceptGroupDm: (path: string) => {
      return ipcRenderer.invoke('realm.ship.accept-group-dm-request', path);
    },
    declineGroupDm: (path: string) => {
      return ipcRenderer.invoke('realm.ship.decline-group-dm-request', path);
    },
    setScreen: (screen: boolean) => {
      return ipcRenderer.invoke('realm.ship.set-dm-screen', screen);
    },
    sendDm: (toShip: string, content: any) => {
      return ipcRenderer.invoke('realm.ship.send-dm', toShip, content);
    },
    draftDm: (patps: Patp[], metadata: any[]) => {
      return ipcRenderer.invoke('realm.ship.draft-dm', patps, metadata);
    },
    removeDm: (ship: string, index: any) => {
      return ipcRenderer.invoke('realm.ship.remove-dm', ship, index);
    },
    readDm: async (ship: Patp) =>
      ipcRenderer.invoke('realm.ship.read-dm', ship),
    readGroupDm: async (path: string) =>
      ipcRenderer.invoke('realm.ship.read-group-dm', path),
    getFriends: () => {
      return ipcRenderer.invoke('realm.ship.get-friends');
    },
    addFriend: async (patp: Patp) =>
      ipcRenderer.invoke('realm.ship.add-friend', patp),
    //
    editFriend: async (
      patp: Patp,
      payload: { pinned: boolean; tags: string[] }
    ) => ipcRenderer.invoke('realm.ship.edit-friend', patp, payload),
    //
    removeFriend: async (patp: Patp) =>
      ipcRenderer.invoke('realm.ship.remove-friend', patp),
    getNotifications: async (timestamp: number, length: number) =>
      ipcRenderer.invoke('realm.ship.get-notifications', timestamp, length),
    openedNotifications: async () =>
      ipcRenderer.invoke('realm.ship.opened-notifications'),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    this.subscribe = this.subscribe.bind(this);
    this.services.slip = new SlipService(core);
    this.rooms = new RoomsService(core);
    this.wallet = new WalletService(core);
  }

  get modelSnapshots() {
    return {
      chat: this.models.chat ? getSnapshot(this.models.chat) : null,
      courier: this.models.courier ? getSnapshot(this.models.courier) : null,
      docket: this.models.docket ? getSnapshot(this.models.docket) : null,
      contacts: this.models.contacts ? getSnapshot(this.models.contacts) : null,
      friends: this.models.friends ? getSnapshot(this.models.friends) : null,
      notifications: this.models.notifications
        ? getSnapshot(this.models.notifications)
        : null,
    };
  }
  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async subscribe(ship: string, shipInfo: any) {
    //
    let secretKey: string | null = this.core.passwords.getPassword(ship)!;
    this.core.sendLog(`secretKey: ${secretKey}`);
    const storeParams = {
      name: 'ship',
      cwd: `realm.${ship}`,
      secretKey,
      accessPropertiesByDotNotation: true,
    };
    this.db =
      process.env.NODE_ENV === 'development'
        ? new Store<ShipModelType>(storeParams)
        : new EncryptedStore<ShipModelType>(storeParams);

    this.core.sendLog(`db: ${JSON.stringify(this.db)}`);

    let persistedState: ShipModelType = this.db.store;
    this.core.sendLog(`persistedState: ${JSON.stringify(persistedState)}`);

    // TODO set up multiple ships properly
    this.state = ShipModel.create({
      patp: ship,
      url: persistedState.url || shipInfo.url,
      wallpaper: persistedState.wallpaper || null,
      color: persistedState.color || null,
      nickname: persistedState.nickname || null,
      avatar: persistedState.avatar || null,
      cookie: persistedState.cookie || shipInfo.cookie,
      loggedIn: true,
      loader: { state: 'initial' },
    });
    this.core.sendLog('before load from disk');

    this.models.notifications = loadNotificationsFromDisk(
      ship,
      secretKey,
      this.core.onEffect
    );
    this.models.chat = loadDMsFromDisk(ship, secretKey, this.core.onEffect);
    this.models.courier = loadCourierFromDisk(
      ship,
      secretKey,
      this.core.onEffect
    );
    this.models.contacts = loadContactsFromDisk(
      ship,
      secretKey,
      this.core.onEffect
    );
    this.models.docket = loadDocketFromDisk(
      ship,
      secretKey,
      this.core.onEffect
    );
    this.models.friends = loadFriendsFromDisk(
      ship,
      secretKey,
      this.core.onEffect
    );
    secretKey = null;
    this.core.sendLog('after load from disk');

    this.core.services.desktop.load(ship, this.state.color || '#4E9EFD');

    onSnapshot(this.state, (snapshot: any) => {
      this.db!.store = snapshot;
    });
    // 1. Send initial snapshot
    // const syncEffect = {
    //   model: getSnapshot(this.state!),
    //   resource: 'ship',
    //   key: ship,
    //   response: 'initial',
    // };
    // console.log(syncEffect);
    // this.core.onEffect(syncEffect);

    try {
      await new Promise<ShipModelType>((resolve, reject) => {
        // TODO rewrite the contact store logic
        try {
          this.core.conduit!.watch({
            app: 'contact-store',
            path: '/all',
            onEvent: (data: any) => {
              this.models.contacts!.setInitial(data);
            },
            onError: () => console.log('Subscription rejected'),
            onQuit: () => console.log('Kicked from subscription'),
          });
        } catch {
          console.log('Subscription failed');
        }
        this.core.sendLog(`after contact watch`);

        FriendsApi.watchFriends(this.core.conduit!, this.models.friends);

        ContactApi.getContact(this.core.conduit!, ship).then((value: any) => {
          this.state!.setOurMetadata(value);
        });

        MetadataApi.syncGraphMetadata(this.core.conduit!, this.metadataStore);

        // register dm update handler
        DmApi.updates(this.core.conduit!, this.models.courier!);
        CourierApi.dmUpdates(this.core.conduit!, this.models.courier!);
        NotificationApi.updates(
          this.core.conduit!,
          this.models.notifications!,
          this.models.courier
        );

        DocketApi.getApps(this.core.conduit!).then((apps) => {
          this.models.docket.setInitial(apps);
          this.state!.loader.set('loaded');
          this.core.sendLog(`docket laoded`);

          resolve(this.state!);
        });
      });
      // const invitations = await PassportsApi.getVisas(this.core.conduit!);
      // this.models.invitations.initial(invitations);

      this.services.slip?.subscribe();
      this.rooms?.onLogin(ship);
      this.wallet?.onLogin(ship);

      // return ship state
    } catch (err) {
      this.core.sendLog(`error in ship try ${err.toString()}`);
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

  get roomSnapshot() {
    return this.rooms?.snapshot;
  }

  get walletSnapshot() {
    return this.wallet?.snapshot;
  }

  async init(ship: string) {
    const syncEffect = {
      model: getSnapshot(this.state!),
      resource: 'ship',
      key: ship,
      response: 'initial',
    };
    this.core.onEffect(syncEffect);
  }

  logout() {
    this.db = undefined;
    this.state = undefined;
    this.rooms?.onLogout();
    this.models.chat = undefined;
    this.models.contacts = undefined;
    this.models.courier = undefined;
    this.models.notifications = NotificationStore.create({});
    // this.models.docket = undefined;
    // this.models.friends = undefined;
    this.core.mainWindow.webContents.send('realm.on-logout');
  }

  storeNewShip(ship: AuthShipType): ShipModelType {
    const newShip = ShipModel.create({
      patp: ship.patp,
      url: ship.url,
      cookie: ship.cookie,
      wallpaper: ship.wallpaper || null,
      color: ship.color || null,
      nickname: ship.nickname || null,
      avatar: ship.avatar || null,
    });

    const storeParams = {
      name: 'ship',
      cwd: `realm.${ship.patp}`,
      secretKey: this.core.passwords.getPassword(ship.patp)!,
      accessPropertiesByDotNotation: true,
    };
    this.db =
      process.env.NODE_ENV === 'development'
        ? new Store<ShipModelType>(storeParams)
        : new EncryptedStore<ShipModelType>(storeParams);

    this.db.store = newShip;
    return newShip;
  }

  removeShip(patp: string) {
    // TODO clean out the folder here.
    const deletedShip = new Store<ShipModelType>({
      name: 'ship',
      cwd: `realm.${patp}`,
      accessPropertiesByDotNotation: true,
    });
    deletedShip.clear();
  }

  async getOurGroups(_event: any): Promise<any> {
    return await GroupsApi.getOur(this.core.conduit!);
  }

  // ------------------------------------------
  // ------------ Action handlers -------------
  // ------------------------------------------
  //
  async getFriends(_event: IpcMainInvokeEvent) {
    return await FriendsApi.getFriends(this.core.conduit!);
  }
  //
  async addFriend(_event: IpcMainInvokeEvent, patp: Patp) {
    return await FriendsApi.addFriend(this.core.conduit!, patp);
  }
  //
  async editFriend(
    _event: IpcMainInvokeEvent,
    patp: Patp,
    payload: { pinned: boolean; tags: string[] }
  ) {
    return await FriendsApi.editFriend(this.core.conduit!, patp, payload);
  }

  async removeFriend(_event: IpcMainInvokeEvent, patp: Patp) {
    return await FriendsApi.removeFriend(this.core.conduit!, patp);
  }
  // ---
  getContact(_event: IpcMainInvokeEvent, ship: string): any {
    const patp = ship.includes('~') ? ship : `~${ship}`;
    const contact = this.models.contacts?.getContactAvatarMetadata(patp);
    return contact;
  }
  //
  async saveMyContact(_event: IpcMainInvokeEvent, profileData: any) {
    await ContactApi.saveContact(
      this.core.conduit!,
      this.state!.patp,
      profileData
    );

    this.state?.setOurMetadata(profileData);

    return;
  }

  getMetadata(_event: any, path: string): any {
    return this.metadataStore['graph'][path];
  }

  async getAppPreview(_event: any, ship: string, desk: string): Promise<any> {
    return await DocketApi.requestTreaty(
      ship,
      desk,
      this.models.docket,
      this.core.conduit!,
      this.metadataStore
    );
  }

  async getDMs() {
    if (!this.core.conduit) {
      return;
    }
    return await CourierApi.getDMList(this.core.conduit);
  }

  async getDMLog(_event: any, ship: Patp) {
    const dmLog = await CourierApi.getDMLog(ship, this.core.conduit!);
    this.models.courier?.setDMLog(dmLog);
    const dms = this.models.courier?.dms.get(dmLog.path);
    return toJS(dms?.messages);
  }

  async acceptDm(_event: any, toShip: string) {
    console.log('acceptingDM', toShip);
    return await CourierApi.acceptDm(this.core.conduit!, toShip);
  }

  async declineDm(_event: any, toShip: string) {
    console.log('rejectingDM', toShip);
    return await CourierApi.declineDm(this.core.conduit!, toShip);
  }

  /**
   * Sets the unread count of a dm inbox to 0
   *
   * @param _event
   * @param toShip
   * @returns
   */
  async readDm(_event: any, toShip: string) {
    return await CourierApi.readDm(this.core.conduit!, toShip);
  }

  /**
   * Sets the unread count of a group dm channel to 0
   *
   * @param _event
   * @param path
   * @returns
   */
  async readGroupDm(_event: any, path: string) {
    const split = path.split('/');
    const host = split[0];
    const timestamp = split[1];
    return await CourierApi.readGroupDm(this.core.conduit!, host, timestamp);
  }

  async acceptGroupDm(_event: any, path: string) {
    const inviteId = this.models.courier?.previews.get(path)?.inviteId;
    console.log('acceptingDM', path, inviteId);
    if (inviteId) {
      return await CourierApi.acceptGroupDm(this.core.conduit!, inviteId);
    }
    return;
  }

  async declineGroupDm(_event: any, path: string) {
    const inviteId = this.models.courier?.previews.get(path)?.inviteId;
    console.log('rejectingDM', path, inviteId);
    if (inviteId) {
      await CourierApi.declineGroupDm(this.core.conduit!, inviteId);
      return this.models.courier?.declineDm(path);
    }
    return;
  }

  async draftNewDm(_event: any, patps: Patp[], metadata: any[]) {
    let draft: any;
    if (patps.length > 1) {
      const reaction: any = await CourierApi.createGroupDM(
        this.core.conduit!,
        patps
      );
      draft = this.models.courier?.draftGroupDM(
        reaction['group-dm-created'] as PreviewGroupDMType
      );
    } else {
      // single dm
      draft = this.models.courier?.draftDM(patps, metadata);
    }
    return toJS(draft);
  }

  async sendDm(_event: any, path: string, contents: any[]) {
    const dmLog = this.models.courier?.dms.get(path)!;
    const post = dmLog.sendDM(this.state!.patp, contents);

    if (dmLog.type === 'group') {
      return await CourierApi.sendGroupDM(this.core.conduit!, path, post);
    } else {
      return await CourierApi.sendDM(this.core.conduit!, path, post);
    }
  }
  async removeDm(_event: any, toShip: string, removeIndex: any) {
    const ourShip = this.state?.patp!;
    console.log('removingDM', ourShip, toShip, removeIndex);
  }

  async getS3Bucket(_event: any) {
    const [credentials, configuration] = await Promise.all([
      S3Api.getCredentials(this.core.conduit!),
      S3Api.getConfiguration(this.core.conduit!),
    ]);

    return {
      credentials,
      configuration,
    };
  }
  async getNotifications(_event: any, timestamp: number, length: number) {
    // console.log('getNotifications: %o, %o', timestamp, length);
    // const timeboxes = this.state?.notifications.timeboxes();
    // console.log(timeboxes);
    return [];
  }
  async openedNotifications(_event: any) {
    // console.log('getNotifications: %o, %o', timestamp, length);
    await NotificationApi.opened(this.core.conduit!);
    // const timeboxes = this.state?.notifications.timeboxes();
    // console.log(timeboxes);
    return;
  }
}
