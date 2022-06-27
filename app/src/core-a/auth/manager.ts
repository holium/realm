import { EventEmitter } from 'stream';
import { ShipInfoType } from '../ship/types';
import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import axios from 'axios';
import { Action } from '..';
import { ContactApi } from '../ship/api/contacts';
import { AuthStore, AuthShip, AuthStoreType, AuthShipType } from './store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';

export interface AuthManagerActions {}

export type AuthPreloadType = {
  addShip: (ship: string, url: string, code: string) => Promise<any>;
  removeShip: (ship: string) => any;
  getShips: () => Promise<any>;
  onOpen: () => Promise<any>;
  getProfile: (ship: string) => Promise<any>;
  saveProfile: (ship: string, data: any) => Promise<any>;
  completeSignup: (ship: any) => Promise<any>;
  setSelected: (ship: string) => Promise<any>;
};

export class AuthManager extends EventEmitter {
  private authStore: Store<AuthStoreType>;
  private stateTree: AuthStoreType;

  constructor() {
    super();
    this.authStore = new Store({
      name: 'auth.manager',
      accessPropertiesByDotNotation: true,
      defaults: AuthStore.create({ firstTime: true }),
    });

    this.onEffect = this.onEffect.bind(this);
    this.initialize = this.initialize.bind(this);
    this.getShips = this.getShips.bind(this);
    this.addShip = this.addShip.bind(this);
    this.removeShip = this.removeShip.bind(this);
    this.onAction = this.onAction.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
    this.completeSignup = this.completeSignup.bind(this);
    this.setSelected = this.setSelected.bind(this);

    ipcMain.handle('auth:add-ship', this.addShip);
    ipcMain.handle('auth:remove-ship', this.removeShip);
    ipcMain.handle('auth:get-ships', this.getShips);
    ipcMain.handle('auth:set-selected', this.setSelected);
    ipcMain.handle('signup:get-profile', this.getProfile);
    ipcMain.handle('signup:save-profile', this.saveProfile);

    let persistedState: AuthStoreType = this.authStore.store;

    this.stateTree = AuthStore.create(castToSnapshot(persistedState));

    onSnapshot(this.stateTree, (snapshot) => {
      this.authStore.store = castToSnapshot(snapshot);
    });

    onPatch(this.stateTree, (patch) => {
      // send patches to UI store
      const patchEffect = {
        patch,
        resource: 'auth',
        response: 'patch',
      };
      this.onEffect(patchEffect);
    });
  }

  // ------------------------------------
  // ------------- Actions --------------
  // ------------------------------------

  completeSignup(patp: string) {
    const ship: AuthShipType = this.stateTree.ships.get(`auth${patp}`)!;
    ship?.setStatus('completed');
    if (this.stateTree.firstTime) {
      this.stateTree.setFirstTime();
    }
    this.stateTree.completeSignup(ship.id);
    return ship;
  }

  setSelected(_event: any, patp: string) {
    const ship = this.stateTree.ships.get(`auth${patp}`);
    this.stateTree.setSelected(ship!);
  }

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
    // console.log(action);
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
    // const path: string = `auth${ship}`;
    const authShip = this.stateTree.ships.get(`auth${ship}`)!;
    let url = authShip.url;
    let cookie = authShip.cookie || '';
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
    const newAuthShip = AuthShip.create({
      id,
      url,
      cookie,
      patp: ship,
      wallpaper:
        'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
    });
    this.authStore.set(`ships.${id}`, getSnapshot(newAuthShip));
    this.stateTree.setShip(newAuthShip);
    // this.stateTree.
    return {
      url,
      cookie,
      patp: parts[1],
      value: parts[2],
    };
  }

  removeShip(_event: any, ship: string) {
    this.stateTree.deleteShip(ship);
  }

  // ------------------------------------
  // -------------- Setup ---------------
  // ------------------------------------

  getProfile = async (_event: any, ship: string) => {
    const credentials = this.getCredentials(ship, '');
    const ourProfile = await ContactApi.getContact(ship, credentials);
    this.stateTree.ships.get(`auth${ship}`)?.setContactMetadata({
      nickname: ourProfile.nickname,
      color: ourProfile.color,
      avatar: ourProfile.avatar,
    });
    return ourProfile;
  };

  saveProfile = async (
    _event: any,
    ship: string,
    data: {
      nickname: string;
      color: string;
      avatar: string | null;
      [key: string]: any;
    }
  ) => {
    const credentials = this.getCredentials(ship, '');

    const updatedProfile = await ContactApi.saveContact(
      ship,
      credentials,
      data
    );
    this.stateTree.ships.get(`auth${ship}`)?.setContactMetadata({
      nickname: updatedProfile.nickname,
      color: updatedProfile.color,
      avatar: updatedProfile.avatar,
    });
    return updatedProfile;
    // Get current contact data
    // const ourProfile = await ContactApi.getContact(ship, credentials);
    // ourProfile['last-updated'] = Date.now();
    // return new Promise((resolve, reject) => {
    //   const conduit = new Conduit(credentials.url, ship, credentials.cookie);
    //   conduit.on('ready', () => {
    //     // console.log('on ready', data);
    //     const json1 = [
    // {
    //   edit: {
    //     ship,
    //     'edit-field': {
    //       nickname: data.nickname,
    //     },
    //     timestamp: Date.now(),
    //   },
    // },
    //     ];
    //     // const json2 = {
    //     //   edit: {
    //     //     ship,
    //     //     'edit-field': {
    //     //       color: data.color,
    //     //     },
    //     //     timestamp: Date.now(),
    //     //   },
    //     // };
    //     // const json3 = {
    //     //   edit: {
    //     //     ship,
    //     //     'edit-field': {
    //     //       avatar: data.avatar,
    //     //     },
    //     //     timestamp: Date.now(),
    //     //   },
    //     // };
    //     const msgId = conduit.counter + 4;
    //     // console.log('msgId', msgId);
    //     conduit
    //       .subscribe('contact-store', '/all', {
    //         onError: (err: any) => {
    //           console.log('in onError');
    //           reject(err);
    //           conduit.close();
    //         },
    //         onEvent: (event: any) => {
    //           console.log('in onEvent', event.id);
    //           if (event.id === msgId) {
    //             resolve(data);
    //             conduit.close();
    //           }
    //         },
    //       })
    //       .then(() => {
    //         conduit.bulkAction('contact-store', json1, 'contact-update-0');
    //       });
    //     // Send the action
    //   });
    // });

    // return await ContactApi.saveContact(ship, credentials, {
    //   edit: {
    //     ship,
    //     'edit-field': data,
    //     timestamp: Date.now(),
    //   },
    //   // add: { ship, contact: { ...ourProfile, ...data } },
    // });
  };
  // ------------------------------------
  // ------------- Handlers -------------
  // ------------------------------------
  static preload = {
    addShip: (ship: string, url: string, code: string) => {
      return ipcRenderer.invoke('auth:add-ship', ship, url, code);
    },
    setSelected: (ship: string) => {
      return ipcRenderer.invoke('auth:set-selected', ship);
    },
    getProfile: async (ship: string) => {
      return ipcRenderer.invoke('signup:get-profile', ship);
    },
    saveProfile: (
      ship: string,
      data: { nickname: string; color: string; avatar: string }
    ) => {
      return ipcRenderer.invoke('signup:save-profile', ship, data);
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
