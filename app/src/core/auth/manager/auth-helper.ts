import { ipcMain, ipcRenderer } from 'electron';
import isDev from 'electron-is-dev';
import axios from 'axios';
import Store from 'electron-store';

const store = new Store({ name: 'ships' });

async function authenticate(
  _event: any,
  ship: string,
  url: string,
  code: string
) {
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
  store.set(`ships.${ship}`, { url, cookie });
  return {
    url,
    cookie,
    name: parts[1],
    value: parts[2],
  };
}

async function removeShip(_event: any, ship: string) {
  store.delete(`ships.${ship}`);
}

async function getShips() {
  return store.get('ships');
}

export function start(): void {
  ipcMain.handle('auth:add-ship', authenticate);
  ipcMain.handle('auth:remove-ship', removeShip);
  ipcMain.handle('auth:get-ships', getShips);
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
