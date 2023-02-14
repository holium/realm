import { Realm } from '../index';
import { EventEmitter } from 'stream';
// import {
//   getSnapshot,
//   IModelType,
//   IType,
//   IStateTreeNode,
// } from 'mobx-state-tree';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import { Patp } from '../types';

export interface SlipType {
  time: Number;
  from: Patp;
  path: string[];
  data: any;
}

/**
 * Slip Service
 *
 * General signaling pokes
 *
 */
export class SlipService extends EventEmitter {
  core: Realm;
  options: any;
  slipId!: number | null;
  latest!: SlipType;
  // private state?: any;

  constructor(core: Realm, options: any = {}) {
    super();
    this.core = core;
    this.options = options;
    ipcMain.handle('realm.slip.send', this.sendSlip.bind(this));
    this.handleSlip = this.handleSlip.bind(this);
    this.onQuit = this.onQuit.bind(this);
    this.onError = this.onError.bind(this);
    this.onSlip = this.onSlip.bind(this);
  }

  async subscribe() {
    await this.core.conduit!.watch({
      app: 'slip',
      path: '/slip/local',
      onEvent: this.handleSlip,
      onQuit: this.onQuit,
      onError: this.onError,
    });
  }

  // async unsubscribe() {
  //   this.core.conduit.unsubscribe(this.slipId!);
  //   this.core.conduit.delete();
  //   this.slipId = null;
  // }

  async sendSlip(
    _event: IpcMainInvokeEvent,
    to: Patp[],
    // path: string[],
    data: any
  ) {
    // If for some reason we are not connected
    // if (!this.slipId) await this.subscribe();
    const now = Date.now();
    // Poke slip
    this.core.conduit!.poke({
      app: 'slip',
      mark: 'slip-action',
      json: {
        slop: {
          time: now,
          to,
          path: [''],
          data,
        },
      },
    });
  }

  handleSlip(slip: any) {
    // console.log(slip);
    if (!slip['slip-action']) return;
    if (!slip['slip-action'].slip) return;
    slip = slip['slip-action'].slip;
    let data;
    try {
      data = JSON.parse(slip.data);
    } catch (e) {
      console.log(e);
      data = slip.data;
    }
    this.latest = { time: slip.time, from: slip.from, path: slip.path, data };
    this.onSlip(this.latest);
  }

  onQuit() {
    console.log('fail!');
  }

  onError(err: any) {
    console.log('err!', err);
  }

  /**
   * onSlip: sends effect data to the core process
   *
   * @param data
   */
  onSlip(data: any) {
    this.core.mainWindow.webContents.send('realm.on-slip', data);
  }

  /**
   * Preload functions to register with the renderer
   */
  static preload = {
    sendSlip: async (to: Patp[], data: any) =>
      await ipcRenderer.invoke('realm.slip.send', to, data),
    onSlip: (callback: any) => ipcRenderer.on('realm.on-slip', callback),
  };
}
