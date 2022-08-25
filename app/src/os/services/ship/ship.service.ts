import {
  ipcMain,
  IpcMainInvokeEvent,
  IpcMessageEvent,
  ipcRenderer,
} from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  IStateTreeNode,
  IAnyModelType,
  IType,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { ShipModelType, ShipModel } from './models/ship';
import { MSTAction, Patp } from '../../types';
import { ContactApi } from '../../api/contacts';
import { DmApi } from '../../api/dms';
import { DocketApi } from '../../api/docket';
import { MetadataApi } from '../../api/metadata';
import { AuthShipType } from '../identity/auth.model';
import { GroupsApi } from '../../api/groups';
import { RoomsService } from '../tray/rooms.service';
import { FriendsApi } from '../../api/friends';
import { FriendsStore, FriendsType } from './models/friends';
import { NotificationsApi } from '../../api/notifications';
import { NotificationsStore, NotificationsType } from './models/notifications';
import { ContactStore, ContactStoreType } from './models/contacts';
import { DocketStore, DocketStoreType } from './models/docket';
import { ChatStoreType, ChatStore } from './models/dms';
import { loadDMsFromDisk } from './stores/dms';
import { loadContactsFromDisk } from './stores/contacts';
import { loadDocketFromDisk } from './stores/docket';
import { loadFriendsFromDisk } from './stores/friends';

export type ShipModels = {
  friends: FriendsType;
  contacts?: ContactStoreType;
  docket: DocketStoreType;
  chat?: ChatStoreType;
};

type ShipSubscriptions = {
  contacts: number;
  friends: number;
  metadata: number;
  dms: number;
  graphDms: number;
};

type SubscriptionKey = keyof ShipSubscriptions;
/**
 * ShipService
 */
export class ShipService extends BaseService {
  private db?: Store<ShipModelType>;
  private state?: ShipModelType;
  private models: ShipModels = {
    friends: FriendsStore.create({ all: {} }),
    contacts: undefined,
    docket: DocketStore.create({ apps: {} }),
    chat: undefined,
  };
  private subscriptions: ShipSubscriptions = {
    contacts: 0,
    friends: 0,
    metadata: 0,
    dms: 0,
    graphDms: 0,
  };
  private metadataStore: {
    graph: { [key: string]: any };
  } = {
    graph: {},
  };
  private rooms?: RoomsService;
  handlers = {
    'realm.ship.get-dms': this.getDMs,
    'realm.ship.send-dm': this.sendDm,
    'realm.ship.get-metadata': this.getMetadata,
    'realm.ship.get-contact': this.getContact,
    'realm.ship.accept-dm-request': this.acceptDm,
    'realm.ship.decline-dm-request': this.declineDm,
    'realm.ship.get-app-preview': this.getAppPreview,
    'realm.ship.get-our-groups': this.getOurGroups,
    'realm.ship.get-friends': this.getFriends,
    'realm.ship.add-friend': this.addFriend,
    'realm.ship.edit-friend': this.editFriend,
    'realm.ship.remove-friend': this.removeFriend,
    'realm.ship.get-notifications': this.getNotifications,
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
    getDMs: () => {
      return ipcRenderer.invoke('realm.ship.get-dms');
    },
    getMetadata: (path: string) => {
      return ipcRenderer.invoke('realm.ship.get-metadata', path);
    },
    getContact: (ship: string) => {
      return ipcRenderer.invoke('realm.ship.get-contact', ship);
    },
    acceptDm: (toShip: string) => {
      return ipcRenderer.invoke('realm.ship.accept-dm-request', toShip);
    },
    declineDm: (toShip: string) => {
      return ipcRenderer.invoke('realm.ship.decline-dm-request', toShip);
    },
    setScreen: (screen: boolean) => {
      return ipcRenderer.invoke('realm.ship.set-dm-screen', screen);
    },
    sendDm: (toShip: string, content: any) => {
      return ipcRenderer.invoke('realm.ship.send-dm', toShip, content);
    },
    removeDm: (ship: string, index: any) => {
      return ipcRenderer.invoke('realm.ship.remove-dm', ship, index);
    },
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
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
    this.rooms = new RoomsService(core);

    this.subscribe = this.subscribe.bind(this);
  }

  get modelSnapshots() {
    return {
      chat: this.models.chat ? getSnapshot(this.models.chat) : null,
      docket: this.models.docket ? getSnapshot(this.models.docket) : null,
      contacts: this.models.contacts ? getSnapshot(this.models.contacts) : null,
      friends: this.models.friends ? getSnapshot(this.models.friends) : null,
    };
  }
  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async subscribe(ship: string, shipInfo: any) {
    // TODO password protect data
    this.db = new Store<ShipModelType>({
      name: 'ship',
      cwd: `realm.${ship}`,
    });
    let persistedState: ShipModelType = this.db.store;

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
    this.models.chat = loadDMsFromDisk(ship, this.core.onEffect);
    this.models.contacts = loadContactsFromDisk(ship, this.core.onEffect);
    this.models.docket = loadDocketFromDisk(ship, this.core.onEffect);
    this.models.friends = loadFriendsFromDisk(ship, this.core.onEffect);

    // this.models.bazaar = loadBazaarFromDisk(patp, this.core.onEffect);

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
      await new Promise<ShipModelType>(async (resolve, reject) => {
        try {
          await this.core.conduit!.watch({
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

        this.subscriptions.friends = await FriendsApi.watchFriends(
          this.core.conduit!,
          this.models.friends
        );

        ContactApi.getContact(this.core.conduit!, ship).then((value: any) => {
          this.state!.setOurMetadata(value);
        });

        this.subscriptions.metadata = await MetadataApi.syncGraphMetadata(
          this.core.conduit!,
          this.metadataStore
        );

        // register dm update handler
        this.subscriptions.dms = await DmApi.updates(
          this.core.conduit!,
          this.models.chat!
        );
        this.subscriptions.graphDms = await DmApi.graphUpdates(
          this.core.conduit!,
          this.models.chat!
        );

        // register hark-store update handler
        // TODO commenting out for now
        // NotificationsApi.watch(this.core.conduit!, this.state);

        DocketApi.getApps(this.core.conduit!).then((apps) => {
          this.models.docket.setInitial(apps);
          this.state!.loader.set('loaded');
          console.log('resolving');
          resolve(this.state!);
        });

        // load initial dms
        this.getDMs().then((response) => {
          this.models.chat?.setDMs(ship, response, this.models.contacts);
          // this.state!.chat.setDMs(ship, response);
        });

        this.rooms?.onLogin(ship);
      });

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
      // return ship state
    } catch (err) {
      console.error(err);
    }
    return { ship: this.state, models: this.modelSnapshots };
  }

  get roomSnapshot() {
    return this.rooms?.snapshot;
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
    console.log('logging out');
    this.db = undefined;
    this.state = undefined;
    this.core.mainWindow.webContents.send('realm.auth.on-log-out');
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
      // chat: { loader: { state: 'initial' } },
      // contacts: { ourPatp: ship.patp },
      // docket: {},
    });
    this.db = new Store<ShipModelType>({
      name: `realm.ship.${ship.patp}`,
      accessPropertiesByDotNotation: true,
    });

    this.db.store = newShip;
    return newShip;
  }

  removeShip(patp: string) {
    const deletedShip = new Store<ShipModelType>({
      name: `realm.ship.${patp}`,
      accessPropertiesByDotNotation: true,
    });
    deletedShip.clear();
    // this.stateTree.deleteShip(patp);
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
    return await DmApi.getDMs(this.state?.patp!, this.core.conduit);
  }

  async acceptDm(_event: any, toShip: string) {
    const ourShip = this.state?.patp!;
    console.log('acceptingDM', toShip);
    return await DmApi.acceptDm(ourShip, toShip, this.core.credentials!);
  }
  async declineDm(_event: any, toShip: string) {
    const ourShip = this.state?.patp!;
    return await DmApi.acceptDm(ourShip, toShip, this.core.credentials!);
  }
  async sendDm(_event: any, toShip: string, contents: any[]) {
    const ourShip = this.state?.patp!;
    const dm = this.models.chat?.dms.get(toShip)!;
    dm.sendDm(this.state!.patp, contents);
    // TODO fix send new dm
    // if (this.state?.chat.dms.get(toShip)) {
    // } else {
    //   // this.state?.chat.sendNewDm([toShip], this.con)
    //   // const dm = this.state?.chat.dms.get(toShip)!;
    //   // dm.sendDm(contents);
    // }
    return await DmApi.sendDM(
      ourShip,
      toShip,
      contents,
      this.core.credentials!
    );
  }
  async removeDm(_event: any, toShip: string, removeIndex: any) {
    const ourShip = this.state?.patp!;
    console.log('removingDM', ourShip, toShip, removeIndex);
  }
  async getNotifications(_event: any, timestamp: number, length: number) {
    console.log('getNotifications: %o, %o', timestamp, length);
    // const timeboxes = this.state?.notifications.timeboxes();
    // console.log(timeboxes);
    return [];
  }
}
