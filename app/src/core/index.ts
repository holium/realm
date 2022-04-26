import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import { AuthManager } from './auth/manager';
import { ShipManager } from './ship/manager';
import { Conduit } from './conduit';
import { SpaceStore, SpaceStoreType } from './context/model';

export type RealmCorePreloadType = {
  login: (ship: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  installRealm: () => Promise<any>;
  onEffect: (callback: any) => Promise<any>;
  onReady: (callback: any) => Promise<any>;
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
    this.authManager = new AuthManager();
    this.shipManager = new ShipManager();
    this.onEffect = this.onEffect.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.installRealm = this.installRealm.bind(this);
    this.onReady = this.onReady.bind(this);
    // Capture all on-effect events and push through the core on-effect
    this.shipManager.on('on-effect', this.onEffect);
  }

  static boot(mainWindow: BrowserWindow) {
    const realmCore = new RealmCore(mainWindow);
    realmCore.authManager.initialize();
    realmCore.shipManager.initialize();
    ipcMain.handle('core:login', realmCore.login);
    ipcMain.handle('core:logout', realmCore.logout);
    ipcMain.handle('core:install-realm', realmCore.installRealm);
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
  }

  onReady() {
    this.mainWindow.webContents.send('core:on-ready');
    this.shipManager.subscribe(this.conduit!, `~${this.ship}`);
  }

  logout(_event: any) {
    // Clean up and encrypt current snapshot
    console.log('closing, logging out');
    this.conduit?.close();
  }

  installRealm() {}

  onEffect(data: any) {
    this.mainWindow.webContents.send('on-effect', data);
  }

  static preload = {
    login: (ship: string, password: string) => {
      return ipcRenderer.invoke('core:login', ship, password);
    },
    logout: () => {
      return ipcRenderer.invoke('core:logout');
    },
    installRealm: () => {
      return ipcRenderer.invoke('core:install-realm');
    },
    onEffect: (callback: any) => ipcRenderer.on('on-effect', callback),
    onReady: (callback: any) => ipcRenderer.on('core:on-ready', callback),
  };
}

export default {
  RealmCore,
};
