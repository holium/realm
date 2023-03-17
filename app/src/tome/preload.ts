import { ipcMain, ipcRenderer } from 'electron';
// import Urbit from '@urbit/http-api';
import { initTome } from './functions';
import { TomeOptions } from './types';

/*
  dispatch client actions to the main process, execute, and return results.
*/
export const tomePreload = {
  /* Senders */
  initTome: async (urbit?: boolean, app?: string, options?: TomeOptions) => {
    return await ipcRenderer.invoke('init-tome', urbit, app, options);
  },
};

ipcMain.handle('init-tome', async (_event, ...args) => {
  return await initTome(...args);
});

export type TomePreloadType = typeof tomePreload;
