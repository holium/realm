import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import { getSnapshot } from 'mobx-state-tree';
import { Realm } from '../../';

import { BaseService } from '../base.service';
import { DiskStore } from '../base.store';
import { ComposerApi } from 'os/api/composer';
import { ComposerStore, ComposerStoreType } from './composer.model';

/**
 * ComposerService
 */
export class ComposerService extends BaseService {
  private db?: DiskStore; // for persistance
  private state?: ComposerStoreType; // for state management

  handlers = {
    'realm.composer.add-space': this.addSpace,
    'realm.composer.remove-space': this.removeSpace,
    'realm.composer.add-stack': this.addStack,
    'realm.composer.remove-stack': this.removeStack,
    'realm.composer.set-current-stack': this.setCurrentStack,
    'realm.composer.add-window': this.addWindow,
    'realm.composer.remove-window': this.removeWindow,
    'realm.composer.set-window-bounds': this.setWindowBounds,
    'realm.composer.set-window-layer': this.setWindowLayer,
  };

  static preload = {
    addSpace: (spacePath: string) => {
      return ipcRenderer.invoke('realm.composer.add-space', spacePath);
    },
    removeSpace(spacePath: string) {
      return ipcRenderer.invoke('realm.composer.remove-space', spacePath);
    },
    addStack(spacePath: string, stack: any) {
      return ipcRenderer.invoke('realm.composer.add-stack', spacePath, stack);
    },
    removeStack(spacePath: string, stackId: string) {
      return ipcRenderer.invoke(
        'realm.composer.remove-stack',
        spacePath,
        stackId
      );
    },
    setCurrentStack(spacePath: string, stackId: string) {
      return ipcRenderer.invoke(
        'realm.composer.set-current-stack',
        spacePath,
        stackId
      );
    },
    addWindow(spacePath: string, stackId: string, window: any) {
      return ipcRenderer.invoke(
        'realm.composer.add-window',
        spacePath,
        stackId,
        window
      );
    },
    removeWindow(spacePath: string, stackId: string, windowId: string) {
      return ipcRenderer.invoke(
        'realm.composer.remove-window',
        spacePath,
        stackId,
        windowId
      );
    },
    setWindowBounds(
      spacePath: string,
      stackId: string,
      windowId: string,
      bounds: any
    ) {
      return ipcRenderer.invoke(
        'realm.composer.set-window-bounds',
        spacePath,
        stackId,
        windowId,
        bounds
      );
    },
    setWindowLayer(
      spacePath: string,
      stackId: string,
      windowId: string,
      layer: number
    ) {
      return ipcRenderer.invoke(
        'realm.composer.set-window-layer',
        spacePath,
        stackId,
        windowId,
        layer
      );
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async load(patp: string) {
    const secretKey: string | null = this.core.passwords.getPassword(patp);
    this.db = new DiskStore('composer', patp, secretKey!, ComposerStore, {});
    this.state = this.db.model as ComposerStoreType;
    this.db.initialUpdate(this.core.onEffect);
    this.db.registerPatches(this.core.onEffect);
  }

  // ***********************************************************
  // ************************ COMPOSER ***************************
  // ***********************************************************

  async addSpace(_event: IpcMainInvokeEvent, spacepath: string) {
    ComposerApi.addSpace(this.core.conduit!, spacepath);
  }

  async removeSpace(_event: IpcMainInvokeEvent, spacepath: string) {
    ComposerApi.removeSpace(this.core.conduit!, spacepath);
  }

  async addStack(_event: IpcMainInvokeEvent, spacepath: string, stack: any) {
    ComposerApi.addStack(this.core.conduit!, spacepath, stack);
  }

  async removeStack(
    _event: IpcMainInvokeEvent,
    spacepath: string,
    stackId: string
  ) {
    ComposerApi.removeStack(this.core.conduit!, spacepath, stackId);
  }

  async setCurrentStack(
    _event: IpcMainInvokeEvent,
    spacepath: string,
    stackId: string
  ) {
    ComposerApi.setCurrentStack(this.core.conduit!, spacepath, stackId);
  }

  async addWindow(
    _event: IpcMainInvokeEvent,
    spacepath: string,
    stackId: string,
    window: any
  ) {
    ComposerApi.addWindow(this.core.conduit!, spacepath, stackId, window);
  }

  async removeWindow(
    _event: IpcMainInvokeEvent,
    spacepath: string,
    stackId: string,
    windowId: string
  ) {
    ComposerApi.removeWindow(this.core.conduit!, spacepath, stackId, windowId);
  }

  setWindowBounds(
    _event: IpcMainInvokeEvent,
    spacepath: string,
    stackId: string,
    windowId: string,
    bounds: any
  ) {
    ComposerApi.setWindowBounds(
      this.core.conduit!,
      spacepath,
      stackId,
      windowId,
      bounds
    );
  }

  setWindowLayer(
    _event: IpcMainInvokeEvent,
    spacepath: string,
    stackId: string,
    windowId: string,
    layer: number
  ) {
    ComposerApi.setWindowLayer(
      this.core.conduit!,
      spacepath,
      stackId,
      windowId,
      layer
    );
  }
}
