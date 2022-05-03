import { EventEmitter } from 'stream';
import { ShipInfoType } from './../ship/types';
import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import axios from 'axios';
import { Action } from '..';
import { ContactApi } from '../ship/modules/contact';
import { AuthStore, AuthShip, AuthStoreType, AuthShipType } from './store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  ReferenceIdentifier,
  destroy,
} from 'mobx-state-tree';

export interface AuthManagerActions {}

export type AuthPreloadType = {
  addShip: (ship: string, url: string, code: string) => Promise<any>;
  removeShip: (ship: string) => Promise<any>;
  getShips: () => Promise<any>;
  onOpen: () => Promise<any>;
  getProfile: (ship: string) => Promise<any>;
};

export class AuthManager extends EventEmitter {
  private authStore: Store<AuthStoreType>;
  private stateTree: AuthStoreType;

  constructor() {
    super();
    this.authStore = new Store({
      name: 'auth.manager',
      accessPropertiesByDotNotation: true,
    });

    this.onEffect = this.onEffect.bind(this);
    this.initialize = this.initialize.bind(this);
    this.getShips = this.getShips.bind(this);
    this.addShip = this.addShip.bind(this);
    this.removeShip = this.removeShip.bind(this);
    this.onAction = this.onAction.bind(this);
    this.getProfile = this.getProfile.bind(this);

    ipcMain.handle('auth:add-ship', this.addShip);
    ipcMain.handle('auth:remove-ship', this.removeShip);
    ipcMain.handle('auth:get-ships', this.getShips);
    ipcMain.handle('signup:get-profile', this.getProfile);

    let persistedState: AuthStoreType = this.authStore.store;

    this.stateTree = AuthStore.create(castToSnapshot(persistedState));

    onSnapshot(this.stateTree, (snapshot) => {
      this.authStore.set('ships', snapshot.ships);
      this.authStore.set('order', snapshot.order);
      this.authStore.set('firstTime', snapshot.firstTime);
      this.authStore.set('selected', snapshot.selected);
    });

    onPatch(this.stateTree, (patch) => {
      // send patches to UI store
      const patchEffect = {
        patch,
        resource: 'auth',
        response: 'patch',
      };
      console.log(patchEffect);
      this.onEffect(patchEffect);
    });
  }

  // ------------------------------------
  // ------------- Actions --------------
  // ------------------------------------

  setLoggedIn(patp: string) {
    const ship = this.stateTree.ships.get(`auth${patp}`);
    ship?.setLoggedIn(true);
    this.stateTree.setSelected(ship!);
  }

  setLoggedOut(patp: string) {
    this.stateTree.ships.get(`auth${patp}`)?.setLoggedIn(false);
    // this.stateTree.clearSelected();
  }

  onAction(action: Action) {
    console.log(action);
    this.authStore.set(
      `ships.auth${action.context.ship}.${action.data.key}`,
      action.data.value
    );
  }

  currentSession() {
    if (this.stateTree.selected?.loggedIn) {
      const { patp, url, cookie } = this.stateTree.selected!;
      return { patp, url, cookie };
    }
    return null;
  }

  initialize() {
    const syncEffect = {
      model: getSnapshot(this.stateTree),
      resource: 'auth',
      response: 'initial',
    };
    this.onEffect(syncEffect);
  }

  // -------------------------------------------------------
  // ----------------------- ACTIONS -----------------------
  // -------------------------------------------------------
  onOpen() {}

  onEffect(data: any) {
    this.emit('on-effect', data);
  }

  getCredentials(ship: string, password: string) {
    const path: string = `ships.auth${ship}`;
    const { url, cookie } = this.authStore.get<any, any>(path);
    return { url, cookie };
  }

  getShips() {
    return this.authStore.get('ships');
  }

  getShip(ship: string): ShipInfoType {
    return this.authStore.get(`ships.auth${ship}`);
  }

  async addShip(_event: any, ship: string, url: string, code: string) {
    const response = await axios.post(
      `${url}/~/login`,
      `password=${code.trim()}`,
      {
        withCredentials: true,
      }
    );

    const cookie = response.headers['set-cookie']![0];
    const id = `auth${ship}`;

    const parts = new RegExp(/(urbauth-~[\w-]+)=(.*); Path=\/;/).exec(
      cookie!.toString()
    )!;
    AuthShip.create({
      id,
      url,
      patp: ship,
      wallpaper:
        'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4096&q=80',
    });
    this.authStore.set(`ships.${id}`, {
      url,
      cookie,
      patp: ship,
      id: `auth${ship}`,
    });
    // this.stateTree.
    return {
      url,
      cookie,
      patp: parts[1],
      value: parts[2],
    };
  }

  removeShip(_event: any, ship: string) {
    // @ts-ignore
    this.authStore.delete(`ships.${ship}`);
  }

  // ------------------------------------
  // -------------- Setup ---------------
  // ------------------------------------

  getProfile = async (_event: any, ship: string) => {
    const credentials = this.getCredentials(ship, '');
    return await ContactApi.getContact(ship, credentials);
  };

  // ------------------------------------
  // ------------- Handlers -------------
  // ------------------------------------
  static preload = {
    addShip: (ship: string, url: string, code: string) => {
      return ipcRenderer.invoke('auth:add-ship', ship, url, code);
    },
    removeShip: (ship: string) => {
      return ipcRenderer.invoke('auth:remove-ship', ship);
    },
    getProfile: async (ship: string) => {
      return ipcRenderer.invoke('signup:get-profile', ship);
    },
    setProfile: (
      ship: string,
      nickname?: string,
      color?: string,
      avatar?: string
    ) => {
      return ipcRenderer.invoke(
        'signup:set-profile',
        ship,
        nickname,
        color,
        avatar
      );
    },
    getShips: () => {
      return ipcRenderer.invoke('auth:get-ships');
    },
  };
}

// export function start(mainWindow: BrowserWindow) {
//   // const authManager = new AuthManager(mainWindow);
//   ipcMain.handle('auth:add-ship', authManager.addShip);
//   ipcMain.handle('auth:remove-ship', authManager.removeShip);
//   ipcMain.handle('auth:get-ships', authManager.getShips);
//   // ipcMain.handle('auth:login', authManager.login);
//   // ipcMain.handle('auth:logout', authManager.logout);
// }

// export const preload = {
//   addShip: (ship: string, url: string, code: string) => {
//     return ipcRenderer.invoke('auth:add-ship', ship, url, code);
//   },
//   removeShip: (ship: string) => {
//     return ipcRenderer.invoke('auth:remove-ship', ship);
//   },
//   getShips: () => {
//     return ipcRenderer.invoke('auth:get-ships');
//   },
// };
