import Store from 'electron-store';

import { ipcMain, ipcRenderer } from 'electron';
import { EventEmitter } from 'stream';
import isDev from 'electron-is-dev';
import axios from 'axios';
// import { SecureStore } from '../../lib/secure-store';
const lomder = {
  url: 'https://lomder-librun.holium.network',
  color: '#F08735',
  nickname: 'DrunkPlato',
  background:
    'https://images.unsplash.com/photo-1650361072639-e2d0d4f7f3e6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80',
  cookie: [
    'urbauth-~lomder-librun=0v5.3p1g1.iks7n.5arsh.1ikqj.hso76; Path=/; Max-Age=604800',
  ],
};

export interface AuthManagerActions {}

export class AuthManager {
  private authStore: Store;

  constructor() {
    this.authStore = new Store({ name: 'ships' });
    this.getShips = this.getShips.bind(this);
    this.addShip = this.addShip.bind(this);
    this.removeShip = this.removeShip.bind(this);
    // console.log(this.authStore);
    // this.authStore.set('~lomder-librun', lomder);
  }

  // ------------------------------------
  // ------------- Actions --------------
  // ------------------------------------
  getShips() {
    // console.log(this.authStore);
    // this.authStore.set('~lomder-librun', lomder);
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

    const cookie = response.headers['set-cookie'];
    const parts = new RegExp(/(urbauth-~[\w-]+)=(.*); Path=\/;/).exec(
      cookie!.toString()
    )!;
    this.authStore.set(`ships.${ship}`, { url, cookie });
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

export function start() {
  const authManager = new AuthManager();
  ipcMain.handle('auth:add-ship', authManager.addShip);
  ipcMain.handle('auth:remove-ship', authManager.removeShip);
  ipcMain.handle('auth:get-ships', authManager.getShips);
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
};
