import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  cast,
  clone,
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
import { SpacesApi } from '../../api/spaces';
import { snakeify } from '../../lib/obj';

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
    return this.state ? getSnapshot(this.state) : null;
  }

  async load(patp: string, ship: ShipModelType) {
    this.db = new Store({
      name: `realm.spaces.${patp}`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: SpacesStoreType = this.db.store;
    this.state = SpacesStore.create(castToSnapshot(persistedState));

    const tempApps = {
      pinned: ['ballot', 'escape', 'webterm', 'landscape'],
      endorsed: {},
      ...(ship.docket.apps
        ? {
            installed: clone(DocketMap.create(getSnapshot(ship.docket.apps))),
          }
        : { installed: {} }),
    };

    // Get the initial scry
    // TODO for some reason the initial selected reference is undefined so you cant
    // TODO reload to the same space you logged out from
    const spaces = await SpacesApi.getSpaces(this.core.conduit!);
    this.state!.initialScry(spaces, tempApps);
    this.state!.selected &&
      this.core.services.shell.setTheme(this.state!.selected?.theme);

    // initial sync effect
    const syncEffect = {
      model: getSnapshot(this.state!),
      resource: 'spaces',
      key: null,
      response: 'initial',
    };
    this.state.setLoader('loaded');
    this.core.onEffect(syncEffect);

    // set up snapshotting
    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

    // Start patching after we've initialized the state
    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'spaces',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    // Subscribe to sync updates
    SpacesApi.syncUpdates(this.core.conduit!, this.state);
  }

  createNew(_event: any, body: any) {
    console.log('creating new');
  }

  setSelected(_event: any, path: string) {
    const selected = this.state?.selectSpace(path);
    this.core.services.shell.setTheme(selected?.theme!);
  }

  async pinApp(_event: any, path: string, appId: string) {
    console.log('pinning');
    console.log(this.state?.selected);
    this.state?.selected?.pinApp(appId);
    return;
  }

  async unpinApp(_event: any, path: string, appId: string) {
    this.state?.selected?.unpinApp(appId);
    return;
  }

  setPinnedOrder(_event: any, order: any[]) {
    this.state?.selected?.setPinnedOrder(order);
  }

  async setSpaceWallpaper(spacePath: string, color: string, wallpaper: string) {
    const space = this.state?.getSpaceByPath(spacePath);
    if (space) {
      const newTheme = space.theme!.setWallpaper(spacePath, color, wallpaper);
      SpacesApi.updateSpace(
        this.core.conduit!,
        { path: space.path, payload: { theme: snakeify(newTheme) } },
        this.core.credentials!
      );
      return newTheme;
    }
    // todo handle errors better
    return null;
  }
}
