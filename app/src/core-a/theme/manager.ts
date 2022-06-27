import { EventEmitter } from 'stream';
import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { ThemeModelType, ThemeStore, ThemeStoreType } from './store';
import { Action } from 'core-a';

export interface ThemeManagerActions {}

export type ThemePreloadType = {
  setShipTheme: (patp: string, theme: ThemeModelType) => Promise<any>;
  setSpaceTheme: (spaceId: string, theme: ThemeModelType) => Promise<any>;
};

export class ThemeManager extends EventEmitter {
  private theme: Store<any>;
  private stateTree: ThemeStoreType;

  constructor() {
    super();

    this.theme = new Store({
      name: 'theme.manager',
      accessPropertiesByDotNotation: true,
    });

    this.onEffect = this.onEffect.bind(this);
    this.initialize = this.initialize.bind(this);
    this.setShipTheme = this.setShipTheme.bind(this);
    this.setSpaceTheme = this.setSpaceTheme.bind(this);

    ipcMain.handle('theme:set-ship-theme', this.setShipTheme);
    ipcMain.handle('theme:set-space-theme', this.setSpaceTheme);

    let persistedState: ThemeStoreType = this.theme.store;

    this.stateTree = ThemeStore.create(castToSnapshot(persistedState));

    onSnapshot(this.stateTree, (snapshot) => {
      this.theme.store = snapshot;
    });

    onPatch(this.stateTree, (patch) => {
      // send patches to UI store
      const patchEffect = {
        patch,
        resource: 'theme',
        response: 'patch',
      };

      this.onEffect(patchEffect);
    });
  }

  // ------------------------------------
  // ------------- Actions --------------
  // ------------------------------------

  initialize() {
    this.stateTree.loader.set('loaded');
    const syncEffect = {
      model: getSnapshot(this.stateTree),
      resource: 'theme',
      response: 'initial',
    };

    this.onEffect(syncEffect);
  }

  setShipTheme(_event: any, patp: string, theme: ThemeModelType) {
    console.log('set ship theme', patp);
  }
  setSpaceTheme(_event: any, spaceId: string, theme: ThemeModelType) {
    console.log('set space theme', spaceId);
    this.stateTree.setCurrentSpaceTheme(spaceId, theme);
  }

  // -------------------------------------------------------
  // ---------------------- Listeners ----------------------
  // -------------------------------------------------------

  onEffect(data: any) {
    this.emit('on-effect', data);
  }

  onAction(action: Action) {
    console.log(action);
    // this.theme.set(
    //   `themes.auth${action.context.ship}.${action.data.key}`,
    //   action.data.value
    // );
  }

  // ------------------------------------
  // ------------- Handlers -------------
  // ------------------------------------

  static preload = {
    setShipTheme: (patp: string, theme: ThemeModelType) => {
      return ipcRenderer.invoke('theme:set-ship-theme', patp, theme);
    },
    setSpaceTheme: (spaceId: string, theme: ThemeModelType) => {
      return ipcRenderer.invoke('theme:set-space-theme', spaceId, theme);
    },
  };
}
