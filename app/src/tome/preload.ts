import { ipcMain, ipcRenderer } from 'electron';
import Urbit from '@urbit/http-api';
import { Tome, TomeOptions } from './pkg';

/*
  dispatch client actions to the main process, execute, and return results.
*/

export const tomePreload = {
  /* Senders */
  initTome: async (api?: Urbit, app?: string, options: TomeOptions = {}) => {
    return await ipcRenderer.invoke('init-tome', api, app, options);
  },
};

ipcMain.handle('init-tome', async (_event, ...args) => {
  return await Tome.init(...args);
});

export type TomePreloadType = typeof tomePreload;
