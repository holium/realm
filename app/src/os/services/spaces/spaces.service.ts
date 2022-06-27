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
import {
  DocketMap,
  SpaceModel,
  SpacesStore,
  SpacesStoreType,
} from './models/spaces';

import { ShipModelType } from '../ship/models/ship';

/**
 * SpacesService
 */
export class SpacesService extends BaseService {
  private db?: Store<SpacesStoreType>; // for persistance
  private state?: SpacesStoreType; // for state management
  handlers = {
    'realm.spaces.create-new': this.createNew,
    'realm.spaces.set-selected': this.setSelected,
    'realm.spaces.pin-app': this.pinApp,
    'realm.spaces.unpin-app': this.unpinApp,
    'realm.spaces.set-pinned-order': this.setPinnedOrder,
  };

  static preload = {
    createNew: (newSpace: any) => {
      return ipcRenderer.invoke('realm.spaces.create-new', newSpace);
    },
    selectSpace: (spaceId: string) => {
      return ipcRenderer.invoke('realm.spaces.set-selected', spaceId);
    },
    pinApp: (path: string, appId: string) => {
      return ipcRenderer.invoke('realm.spaces.pin-app', path, appId);
    },
    unpinApp: (path: string, appId: string) => {
      return ipcRenderer.invoke('realm.spaces.unpin-app', path, appId);
    },
    setPinnedOrder: (newOrder: any[]) => {
      return ipcRenderer.invoke('realm.spaces.set-pinned-order', newOrder);
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
    return getSnapshot(this.state!);
  }

  async load(patp: string, ship: ShipModelType) {
    this.db = new Store({
      name: `realm.spaces.${patp}`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: SpacesStoreType = this.db.store;
    this.state = SpacesStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'spaces',
        response: 'patch',
      };
      // console.log('patcjhing', patch);
      this.core.onEffect(patchEffect);
    });

    this.setShipSpace(ship);

    const syncEffect = {
      model: getSnapshot(this.state!),
      resource: 'spaces',
      key: null,
      response: 'initial',
    };

    this.state.setLoader('loaded');
    this.core.onEffect(syncEffect);
  }

  createNew(_event: any, body: any) {
    console.log('creating new');
  }

  setSelected(_event: any, path: string) {
    this.state?.selectSpace(path);
  }

  pinApp(_event: any, path: string, appId: string) {
    this.state?.selected?.pinApp(appId);
  }

  unpinApp(_event: any, path: string, appId: string) {
    this.state?.selected?.unpinApp(appId);
  }

  setPinnedOrder(_event: any, order: any[]) {
    this.state?.selected?.setPinnedOrder(order);
  }

  setShipSpace(ship: ShipModelType) {
    const ourSpace = SpaceModel.create({
      path: ship.patp,
      name: ship.nickname || ship.patp,
      color: ship.color || '#000000',
      type: 'our',
      // @ts-ignore FIX
      apps: {
        pinned: ['ballot', 'escape', 'webterm', 'landscape'],
        endorsed: {},
        ...(ship.docket.apps
          ? {
              installed: DocketMap.create(getSnapshot(ship.docket.apps)),
            }
          : { installed: {} }),
      },
      token: undefined,
      picture: ship.avatar || null,
      theme: {
        themeId: 'os',
        // wallpaper: DEFAULT_WALLPAPER,
        wallpaper:
          'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
        backgroundColor: '#c2b4b4',
        dockColor: '#f0ecec',
        windowColor: '#f0ecec',
        textTheme: 'light',
        textColor: '#261f1f',
        iconColor: '#333333',
        mouseColor: '#4E9EFD',
      },
      // theme: {
      //   themeId: ship.patp,
      //   wallpaper: theme.wallpaper,
      //   backgroundColor: theme.backgroundColor,
      //   dockColor: theme.dockColor,
      //   windowColor: theme.windowColor,
      //   textTheme: theme.textTheme,
      //   textColor: theme.textColor,
      //   iconColor: theme.iconColor,
      //   mouseColor: theme.mouseColor,
      // },
    });
    this.state?.setOurSpace(ourSpace);
    // self.selected = self.spaces.get(ship.patp)!;

    // if (self.selected && self.selected.theme.wallpaper) {
    //   osState.theme.setWallpaper(self.selected.theme.wallpaper, {
    //     patp: ship.patp,
    //   });
    // }
  }
}
