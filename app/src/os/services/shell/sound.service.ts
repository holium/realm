import { ipcMain, ipcRenderer } from 'electron';

import Realm from '../..';
import { BaseService } from '../base.service';

/**
 * SoundService
 */
export class SoundService extends BaseService {
  handlers = {
    'realm.audio.play-startup': this.playStartup,
  };

  static preload = {
    playStartup: async () => {
      return ipcRenderer.invoke('reaml.audio.play-startup');
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  playStartup(_event: any) {
    this.core.mainWindow.webContents.send('play-sound', 'startup');
  }
}
