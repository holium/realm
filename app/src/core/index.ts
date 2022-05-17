import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import { getSnapshot } from 'mobx-state-tree';
import { Urbit } from './urbit/api';
import { ThemeManager } from './theme/manager';
import { AuthManager } from './auth/manager';
import { ShipManager } from './ship/manager';
import { SpaceStore, SpaceStoreType } from './spaces/model';
import { ShipInfoType } from './ship/types';

export type RealmCorePreloadType = {
  init: (ship: string) => Promise<any>;
  login: (ship: string, password: string) => Promise<any>;
  logout: (ship: string) => Promise<any>;
  storeNewShip: (ship: any) => Promise<any>;
  removeShip: (ship: string) => Promise<any>;
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
  private conduit?: Urbit;
  private mainWindow: BrowserWindow;
  private authManager: AuthManager;
  private shipManager: ShipManager;
  private themeManager: ThemeManager;
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
    this.removeShip = this.removeShip.bind(this);

    // Create an instance of all managers
    this.authManager = new AuthManager();
    this.shipManager = new ShipManager();
    this.themeManager = new ThemeManager();
    // Capture all on-effect events and push through the core on-effect
    this.shipManager.on('on-effect', this.onEffect);
    this.authManager.on('on-effect', this.onEffect);
    this.themeManager.on('on-effect', this.onEffect);
  }

  static boot(mainWindow: BrowserWindow) {
    const realmCore = new RealmCore(mainWindow);
    // realmCore.authManager.initialize();
    // realmCore.shipManager.initialize();
    // realmCore.themeManager.initialize();
    ipcMain.handle('core:init', realmCore.init);
    ipcMain.handle('core:login', realmCore.login);
    ipcMain.handle('core:logout', realmCore.logout);
    ipcMain.handle('core:install-realm', realmCore.installRealm);
    ipcMain.handle('core:action', realmCore.onAction);
    ipcMain.handle('core:on-start', realmCore.onStart);
    ipcMain.handle('core:set-new-ship', realmCore.setNewShip);
    ipcMain.handle('core:remove-ship', realmCore.removeShip);

    return realmCore;
  }

  connect(url: string, ship: string, cookie: string) {
    this.conduit = new Urbit(url, ship, cookie);
    this.conduit.open();
    this.conduit.onOpen = () => {
      this.onReady();
    };
    this.conduit.onRetry = () => console.log('on retry');
    this.conduit.onError = (err) => console.log('on err', err);
  }

  login(_event: any, ship: string, password: string) {
    const { url, cookie } = this.authManager.getCredentials(ship, password);
    // TODO decrypt stored snapshot
    this.ship = ship.substring(1);
    this.url = url;
    this.cookie = cookie;
    // Initialize conduit
    this.connect(url, ship, cookie);
    this.authManager.setLoggedIn(ship);
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
    this.connect(shipInfo.url, ship, shipInfo.cookie);
  }

  async logout(_event: any, ship: string) {
    // Clean up and encrypt current snapshot
    this.conduit?.reset(); // clean up subscriptions and close conduit
    this.authManager.setLoggedOut(ship); // log out
    this.shipManager.lock(); // lock and encryp ship data
  }

  installRealm() {}

  async setNewShip(_event: any, patp: string) {
    const authShip = this.authManager.completeSignup(patp);
    const newShip = this.shipManager.storeNewShip(authShip);
    return getSnapshot(newShip);
  }

  async removeShip(_event: any, patp: string) {
    this.shipManager.removeShip(patp);
    this.authManager.removeShip(patp);
  }

  onStart(_event: any) {
    const credentials = this.authManager.currentSession();
    this.authManager.initialize();
    this.themeManager.initialize();
    if (credentials) {
      this.init(null, credentials.patp);
    }
  }

  onReady() {
    this.mainWindow.webContents.send('core:on-ready');
    const shipInfo: ShipInfoType = this.authManager.getShip(`~${this.ship}`);
    this.shipManager.subscribe(this.conduit!, `~${this.ship}`, shipInfo);
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
      case 'theme.manager':
        this.themeManager.onAction(action);
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
    storeNewShip: (ship: any) => {
      return ipcRenderer.invoke('core:set-new-ship', ship);
    },
    removeShip: (ship: string) => {
      return ipcRenderer.invoke('core:remove-ship', ship);
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
