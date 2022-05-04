import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import { AuthManager } from './auth/manager';
import { ShipManager } from './ship/manager';
import { Conduit } from './conduit';
import { SpaceStore, SpaceStoreType } from './context/model';
import { ShipInfoType } from './ship/types';

export type RealmCorePreloadType = {
  init: (ship: string) => Promise<any>;
  login: (ship: string, password: string) => Promise<any>;
  logout: (ship: string) => Promise<any>;
  setNewShip: (ship: any) => Promise<any>;
  onStart: () => Promise<any>;
  installRealm: () => Promise<any>;
  onEffect: (callback: any) => Promise<any>;
  onReady: (callback: any) => Promise<any>;
  action: (callback: any) => Promise<any>;
};

export type Action = {
  action: string;
  resource: string;
  context: { [resource: string]: string };
  data: {
    key: string;
    value: any;
  };
};

/**
 * RealmCore
 *
 * The core OS process that syncs data with your ship.
 *
 * @export
 * @class RealmCore
 */
export class RealmCore {
  private url?: string;
  private ship?: string;
  private cookie?: string;
  private conduit?: Conduit;
  private mainWindow: BrowserWindow;
  private authManager: AuthManager;
  private shipManager: ShipManager;
  private stores: {
    spaces: SpaceStoreType;
  };

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    // TODO decrypt and load initial state
    this.stores = {
      spaces: SpaceStore.create({ apps: [], pinned: [] }),
    };

    this.onEffect = this.onEffect.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.installRealm = this.installRealm.bind(this);
    this.onReady = this.onReady.bind(this);
    this.onAction = this.onAction.bind(this);
    this.onStart = this.onStart.bind(this);
    this.init = this.init.bind(this);
    this.setNewShip = this.setNewShip.bind(this);
    this.authManager = new AuthManager();
    this.shipManager = new ShipManager();
    // Capture all on-effect events and push through the core on-effect
    this.shipManager.on('on-effect', this.onEffect);
    this.authManager.on('on-effect', this.onEffect);
  }

  static boot(mainWindow: BrowserWindow) {
    const realmCore = new RealmCore(mainWindow);
    realmCore.authManager.initialize();
    realmCore.shipManager.initialize();
    ipcMain.handle('core:init', realmCore.init);
    ipcMain.handle('core:login', realmCore.login);
    ipcMain.handle('core:logout', realmCore.logout);
    ipcMain.handle('core:install-realm', realmCore.installRealm);
    ipcMain.handle('core:action', realmCore.onAction);
    ipcMain.handle('core:on-start', realmCore.onStart);
    ipcMain.handle('core:set-new-ship', realmCore.setNewShip);
    return realmCore;
  }

  login(_event: any, ship: string, password: string) {
    const { url, cookie } = this.authManager.getCredentials(ship, password);
    // TODO decrypt stored snapshot
    this.ship = ship.substring(1);
    this.url = url;
    this.cookie = cookie;
    // Initialize conduit
    this.conduit = new Conduit(url, ship, cookie);
    this.conduit.on('ready', this.onReady);
    this.authManager.setLoggedIn(ship);
  }

  onStart(_event: any) {
    const credentials = this.authManager.currentSession();
    this.authManager.initialize();
    if (credentials) {
      this.init(null, credentials.patp);
    }
  }

  init(_event: any, ship: string) {
    this.ship = ship.substring(1);
    const shipInfo = this.authManager.getShip(ship);
    if (!shipInfo.loggedIn) {
      this.mainWindow.webContents.send('core:on-ready', {
        status: 'new-session',
      });
      return;
    }

    // else we have already decrypted the shipInfo
    this.conduit = new Conduit(shipInfo.url, ship, shipInfo.cookie);
    this.conduit.on('ready', this.onReady);
  }

  onReady() {
    this.mainWindow.webContents.send('core:on-ready');
    const shipInfo: ShipInfoType = this.authManager.getShip(`~${this.ship}`);
    this.shipManager.subscribe(this.conduit!, `~${this.ship}`, shipInfo);
  }

  async logout(_event: any, ship: string) {
    // Clean up and encrypt current snapshot
    await this.conduit?.close(); // clean up subscriptions and close conduit
    this.authManager.setLoggedOut(ship); // log out
    this.shipManager.lock(); // lock and encryp ship data
  }

  installRealm() {}

  async setNewShip(_event: any, ship: any) {
    console.log('setting ship from signup', ship);
    return ship;
  }

  onAction(_event: any, action: any) {
    console.log('core: ', action);
    switch (action.resource) {
      case 'ship.manager':
        this.shipManager.onAction(action);
        break;
      case 'auth.manager':
        this.authManager.onAction(action);
        break;
      default:
        break;
    }
  }

  onEffect(data: any) {
    this.mainWindow.webContents.send('on-effect', data);
  }

  static preload = {
    onStart: () => {
      return ipcRenderer.invoke('core:on-start');
    },
    init: (ship: string) => {
      return ipcRenderer.invoke('core:init', ship);
    },
    setNewShip: (ship: any) => {
      console.log('setting new ship');
      return ipcRenderer.invoke('core:set-new-ship', ship);
    },
    action: (action: any) => {
      return ipcRenderer.invoke('core:action', action);
    },
    login: (ship: string, password: string) => {
      return ipcRenderer.invoke('core:login', ship, password);
    },
    logout: (ship: string) => {
      return ipcRenderer.invoke('core:logout', ship);
    },
    installRealm: () => {
      return ipcRenderer.invoke('core:install-realm');
    },
    onEffect: (callback: any) => ipcRenderer.on('on-effect', callback),
    onReady: (callback: any) => {
      ipcRenderer.on('core:on-ready', callback);
    },
  };
}

export default {
  RealmCore,
};
