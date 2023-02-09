import { ipcMain, ipcRenderer } from 'electron';
import { onPatch, getSnapshot } from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { ShellStoreType, ShellStore } from './shell.model';

export class ShellService extends BaseService {
  private readonly state?: ShellStoreType; // for state management
  handlers = {
    'realm.shell.set-desktop-dimensions': this.setDesktopDimensions,
    'realm.shell.set-blur': this.setBlur,
    'realm.shell.set-fullscreen': this.setFullscreen,
    'realm.shell.open-dialog': this.openDialog,
    'realm.shell.open-dialog-with-string-props': this.openDialogWithStringProps,
    'realm.shell.close-dialog': this.closeDialog,
    'realm.shell.next-dialog': this.nextDialog,
  };

  static preload = {
    setBlur: async (blurred: boolean, checkDouble: boolean = false) => {
      return await ipcRenderer.invoke(
        'realm.shell.set-blur',
        blurred,
        checkDouble
      );
    },
    setDesktopDimensions: (width: number, height: number) => {
      return ipcRenderer.invoke(
        'realm.shell.set-desktop-dimensions',
        width,
        height
      );
    },
    openDialog: async (dialogId: string) => {
      return await ipcRenderer.invoke('realm.shell.open-dialog', dialogId);
    },
    openDialogWithStringProps: async (dialogId: string, props: any) => {
      return await ipcRenderer.invoke(
        'realm.shell.open-dialog-with-string-props',
        dialogId,
        props
      );
    },
    nextDialog: async (dialogId: string) => {
      return await ipcRenderer.invoke('realm.shell.next-dialog', dialogId);
    },
    closeDialog: async () => {
      return await ipcRenderer.invoke('realm.shell.close-dialog');
    },
    async setFullscreen(isFullscreen: boolean) {
      return await ipcRenderer.invoke(
        'realm.shell.set-fullscreen',
        isFullscreen
      );
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.state = ShellStore.create({});

    // this.db = new Store({
    //   name: `realm.shell`, // TODO add windowId here
    //   accessPropertiesByDotNotation: true,
    // });

    // let persistedState: ShellStoreType = this.db.store;
    // this.state = ShellStore.create(castToSnapshot(persistedState));
    // const syncEffect = {
    //   model: getSnapshot(this.state!),
    //   resource: 'shell',
    //   key: null,
    //   response: 'initial',
    // };
    // this.core.onEffect(syncEffect);
    // onSnapshot(this.state, (snapshot) => {
    //   this.db!.store = castToSnapshot(snapshot);
    // });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'shell',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  get desktopDimensions() {
    return this.state?.desktopDimensions;
  }

  get isFullscreen() {
    return this.state?.isFullscreen;
  }

  public onDevtoolsOpened(callback: any) {
    ipcRenderer.on('realm.shell.devtools-opened', callback);
  }

  public onDevtoolsClosed(callback: any) {
    ipcRenderer.on('realm.shell.devtools-closed', callback);
  }

  setFullscreen(_event: any, isFullscreen: boolean) {
    this.state?.setFullscreen(isFullscreen);
  }

  openDialog(_event: any, dialogId: string) {
    this.state?.closeDialog(); // must close old dialogs first
    this.state?.openDialog(dialogId);
  }

  openDialogWithStringProps(_event: any, dialogId: string, props: any) {
    this.state?.closeDialog(); // must close old dialogs first
    this.state?.openDialogWithStringProps(dialogId, props);
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
}
