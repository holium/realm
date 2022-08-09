import { ipcMain, ipcRenderer } from 'electron';
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
import { MSTAction } from '../../types';
import axios from 'axios';
import { ContactApi } from '../../api/contacts';
import { DmApi } from '../../api/dms';
import { DocketApi } from '../../api/docket';
import { MetadataApi } from '../../api/metadata';
import { AuthShipType } from '../identity/auth.model';
import { GroupsApi } from '../../api/groups';
import { RoomsService } from '../tray/rooms.service';

/**
 * ShipService
 */
export class ShipService extends BaseService {
  private db?: Store<ShipModelType>;
  private state?: ShipModelType;
  private ourGroups: any[] = [];
  private metadataStore: {
    groups: { [key: string]: any };
    graph: { [key: string]: any };
  } = {
    groups: {},
    graph: {},
  };
  private rooms?: RoomsService;
  handlers = {
    'realm.ship.get-dms': this.getDMs,
    'realm.ship.send-dm': this.sendDm,
    'realm.ship.get-metadata': this.getMetadata,
    'realm.ship.accept-dm-request': this.acceptDm,
    'realm.ship.decline-dm-request': this.declineDm,
    'realm.ship.get-app-preview': this.getAppPreview,
    'realm.ship.get-our-groups': this.getOurGroups,
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
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
    this.subscribe = this.subscribe.bind(this);
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async subscribe(ship: string, shipInfo: any) {
    return new Promise<ShipModelType>((resolve, reject) => {
      // TODO password protect data
      this.db = new Store<ShipModelType>({
        name: `realm.ship.${ship}`,
        accessPropertiesByDotNotation: true,
      });
      let persistedState: ShipModelType = this.db.store;

      // TODO set up multiple ships properly
      // this is the error
      // (Object type: 'map<string, AnonymousModel>', Path upon death: '/ships/~0bus/docket/apps', Subpath: 'ballot', Action: '/ships/~0bus/docket/apps.@APPLY_SNAPSHOT()')
      // console.log(this.currentShip);
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
        // theme: castToSnapshot(persistedState.theme),
        chat: persistedState.chat
          ? castToSnapshot(persistedState.chat)
          : { loader: { state: 'initial' } },
        contacts: persistedState.contacts
          ? castToSnapshot(persistedState.contacts)
          : { ourPatp: ship },
        docket: persistedState.docket
          ? castToSnapshot(persistedState.docket)
          : {},
      });

      this.core.services.desktop.load(ship, this.state.color!);

      onSnapshot(this.state, (snapshot: any) => {
        this.db!.store = snapshot;
      });

      const syncEffect = {
        model: getSnapshot(this.state!),
        resource: 'ship',
        key: ship,
        response: 'initial',
      };

      this.core.onEffect(syncEffect);

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

      try {
        this.core.conduit!.subscribe({
          app: 'contact-store',
          path: '/all',
          event: (data: any) => {
            this.state?.contacts.setInitial(data);
          },
          err: () => console.log('Subscription rejected'),
          quit: () => console.log('Kicked from subscription'),
        });
      } catch {
        console.log('Subscription failed');
      }

      ContactApi.getContact(ship, this.core.credentials!).then((value: any) => {
        this.state?.setOurMetadata(value);
      });

      MetadataApi.syncGroupMetadata(
        this.core.conduit!,
        this.metadataStore
      ).then(async () => {
        const groupMetadata = Object.values(this.metadataStore.groups).reduce(
          (groupMap, group) => {
            return {
              ...groupMap,
              [group.resource]: group,
            };
          },
          {}
        );
        this.ourGroups = await GroupsApi.getOur(
          this.core.conduit!,
          groupMetadata
        );
        // console.log(this.ourGroups);
      });
      MetadataApi.syncGraphMetadata(this.core.conduit!, this.metadataStore);

      // register dm update handler
      DmApi.updates(this.core.conduit!, this.state);
      DmApi.graphUpdates(this.core.conduit!, this.state);

      // load initial dms
      this.getDMs().then((response) => {
        this.state?.chat.setDMs(ship, response);
      });

      DocketApi.getApps(this.core.conduit!).then((apps) => {
        this.state?.docket.setInitial(apps);
        this.state?.loader.set('loaded');
        resolve(this.state!);
      });
      
      this.rooms = new RoomsService(this.core);
      
    });
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
      chat: { loader: { state: 'initial' } },
      contacts: { ourPatp: ship.patp },
      docket: {},
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
    // const groupMetadata = Object.values(this.metadataStore.groups).reduce(
    //   (groupMap, group) => {
    //     return {
    //       ...groupMap,
    //       [group.resource]: group,
    //     };
    //   },
    //   {}
    // );

    return this.ourGroups; // await GroupsApi.getOur(this.core.conduit!, groupMetadata);
  }

  // ------------------------------------------
  // ------------ Action handlers -------------
  // ------------------------------------------
  getMetadata(_event: any, path: string): any {
    return this.metadataStore['graph'][path];
  }

  async getAppPreview(_event: any, ship: string, desk: string): Promise<any> {
    return await DocketApi.requestTreaty(
      ship,
      desk,
      this.state?.docket,
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
  // getGroupDMs = async () => {
  //   if (!this.conduit) {
  //     return;
  //   }
  //   return await DmApi.getGroupDMs(this.stateTree?.patp!, this.conduit);
  // };
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
    const dm = this.state?.chat.dms.get(toShip)!;
    dm.sendDm(contents);
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
}
