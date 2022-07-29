import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { ShellStoreType, ShellStore } from './shell.model';


export class ShellService extends BaseService {
  private db?: Store<ShellStoreType>; // for persistance
  private state?: ShellStoreType; // for state management
  handlers = {
    'realm.shell.set-desktop-dimensions': this.setDesktopDimensions,
    'realm.shell.set-blur': this.setBlur,
    'realm.shell.set-fullscreen': this.setFullscreen,
    'realm.shell.open-dialog': this.openDialog,
    'realm.shell.close-dialog': this.closeDialog,
    'realm.shell.next-dialog': this.nextDialog,
    'realm.shell.setIsMouseInWebview': this.setIsMouseInWebview
  };

  static preload = {
    setBlur: (blurred: boolean) => {
      return ipcRenderer.invoke('realm.shell.set-blur', blurred);
    },
    setDesktopDimensions: (width: number, height: number) => {
      return ipcRenderer.invoke(
        'realm.shell.set-desktop-dimensions',
        width,
        height
      );
    },
    openDialog: (dialogId: string) => {
      return ipcRenderer.invoke('realm.shell.open-dialog', dialogId);
    },
    nextDialog: (dialogId: string) => {
      return ipcRenderer.invoke('realm.shell.next-dialog', dialogId);
    },
    closeDialog: () => {
      return ipcRenderer.invoke('realm.shell.close-dialog');
    },
    setFullscreen(isFullscreen: boolean) {
      return ipcRenderer.invoke('realm.shell.set-fullscreen', isFullscreen);
    },
    setIsMouseInWebview(mouseInWebview: boolean) {
      return ipcRenderer.invoke('realm.shell.setIsMouseInWebview', mouseInWebview);
    }
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.db = new Store({
      name: `realm.shell`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: ShellStoreType = this.db.store;
    this.state = ShellStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'shell',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });


    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  setFullscreen(_event: any, isFullscreen: boolean) {
    this.state?.setFullscreen(isFullscreen);
  }

  openDialog(_event: any, dialogId: string) {
    this.state?.closeDialog(); // must close old dialogs first
    this.state?.openDialog(dialogId);
  }

  nextDialog(_event: any, dialogId: string) {
    this.state?.openDialog(dialogId);
  }

  closeDialog(_event: any) {
    this.state?.closeDialog();
  }

  setBlur(_event: any, blurred: boolean) {
    this.state?.setIsBlurred(blurred);
  }

  setDesktopDimensions(_event: any, width: number, height: number) {
    this.state?.setDesktopDimensions(width, height);
  }

  setIsMouseInWebview(_event: any, mouseInWebview: boolean) {
    this.state?.setIsMouseInWebview(mouseInWebview);
  }
}
