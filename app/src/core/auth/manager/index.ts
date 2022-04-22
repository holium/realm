import { BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { ShipManager } from './../../ship/manager';

import { EventEmitter } from 'stream';
import isDev from 'electron-is-dev';
import axios from 'axios';
// import { SecureStore } from '../../lib/secure-store';

export interface AuthManagerActions {}

type ShipInfoType = {
  url: string;
  cookie: string;
  theme?: any;
  wallpaper?: string;
  color?: string;
  nickname?: string;
  avatar?: string;
};
export class AuthManager {
  private authStore: Store;
  private shipManager?: ShipManager;
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.authStore = new Store({ name: 'ships' });
    this.mainWindow = mainWindow;
    this.getShips = this.getShips.bind(this);
    this.addShip = this.addShip.bind(this);
    this.removeShip = this.removeShip.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  // ------------------------------------
  // ------------- Actions --------------
  // ------------------------------------
  login(_event: any, ship: string, password: string) {
    const path: string = `ships.${ship}`;
    const { url, cookie } = this.authStore.get<any, any>(path); // typescript any because rage
    this.shipManager = new ShipManager(url, ship, password, cookie);
    this.shipManager.initialize();
    this.shipManager.on('on-effect', (data: any) => {
      console.log('ship-manager on effect', data);
      this.mainWindow.webContents.send('on-effect', data);
    });
  }
  logout(_event: any, ship: string) {
    this.shipManager?.lock();
  }
  getShips() {
    return this.authStore.get('ships');
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
    this.authStore.set(`ships.${ship}`, { url, cookie });
    const parts = new RegExp(/(urbauth-~[\w-]+)=(.*); Path=\/;/).exec(
      cookie!.toString()
    )!;
    return {
      url,
      cookie,
      name: parts[1],
      value: parts[2],
    };
  }

  removeShip(_event: any, ship: string) {
    this.authStore.delete(`ships.${ship}`);
  }

  // ------------------------------------
  // ------------- Handlers -------------
  // ------------------------------------
}

export function start(mainWindow: BrowserWindow) {
  const authManager = new AuthManager(mainWindow);
  ipcMain.handle('auth:add-ship', authManager.addShip);
  ipcMain.handle('auth:remove-ship', authManager.removeShip);
  ipcMain.handle('auth:get-ships', authManager.getShips);
  ipcMain.handle('auth:login', authManager.login);
  ipcMain.handle('auth:logout', authManager.logout);
}

export const preload = {
  addShip: (ship: string, url: string, code: string) => {
    return ipcRenderer.invoke('auth:add-ship', ship, url, code);
  },
  removeShip: (ship: string) => {
    return ipcRenderer.invoke('auth:remove-ship', ship);
  },
  getShips: () => {
    return ipcRenderer.invoke('auth:get-ships');
  },
  login: (ship: string, password: string) => {
    return ipcRenderer.invoke('auth:login', ship, password);
  },
  logout: () => {
    return ipcRenderer.invoke('auth:logout');
  },
};

export type AuthManagerType = {
  addShip: (ship: string, url: string, code: string) => Promise<any>;
  removeShip: (ship: string) => Promise<any>;
  getShips: () => Promise<any>;
  login: (ship: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
};
