import { ipcMain, ipcRenderer } from 'electron';
import { Realm } from '../../index';
import { BaseService } from '../base.service';
import { PokeParams, Scry } from '@holium/conduit/src/types';

export interface IPCHandlers {
  [channel: string]: (...args: any) => Promise<any> | any;
}

export class RoomsService extends BaseService {
  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  setProvider(provider: string) {
    if (!this.core.conduit) {
      throw new Error('Conduit not connected');
    }
    this.core.conduit.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'set-provider': provider,
      },
    });
  }

  watch() {
    if (!this.core.conduit) {
      throw new Error('Conduit not connected');
    }
    this.core.conduit.watch({
      app: 'rooms-v2',
      path: '/lib',
      onEvent: async (data, _id, mark) => {
        this.core.mainWindow.webContents.send(
          'realm.on-room-update',
          data,
          mark
        );
      },
      onError: () => console.log('rooms subscription rejected'),
      onQuit: () => {
        console.log('Kicked from rooms subscription');
      },
    });
  }

  async poke(_evt: any, params: PokeParams) {
    if (!this.core.conduit) {
      throw new Error('Conduit not connected');
    }
    return await this.core.conduit.poke(params);
  }

  async scry(_evt: any, params: Scry) {
    if (!this.core.conduit) {
      throw new Error('Conduit not connected');
    }
    return await this.core.conduit.scry(params);
  }

  handlers: IPCHandlers = {
    'realm.rooms.poke': this.poke,
    'realm.rooms.scry': this.scry,
  };

  static preload = {
    poke: (params: PokeParams) => {
      return ipcRenderer.invoke('realm.rooms.poke', params);
    },
    scry: (params: Scry) => {
      return ipcRenderer.invoke('realm.rooms.scry', params);
    },
    onUpdate: (
      callback: (
        event: Electron.IpcRendererEvent,
        data: any,
        mark: string
      ) => void
    ) => ipcRenderer.on('realm.on-room-update', callback),
  };
}
