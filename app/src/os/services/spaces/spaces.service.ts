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
import { snakeify, camelToSnake } from '../../lib/obj';
import { spaceToSnake } from '../../lib/text';
import { PassportsApi } from '../../api/passports';

/**
 * SpacesService
 */
export class SpacesService extends BaseService {
  private db?: Store<SpacesStoreType>; // for persistance
  private state?: SpacesStoreType; // for state management
  handlers = {
    'realm.spaces.set-selected': this.setSelected,
    'realm.spaces.pin-app': this.pinApp,
    'realm.spaces.unpin-app': this.unpinApp,
    'realm.spaces.set-pinned-order': this.setPinnedOrder,
    'realm.spaces.create-space': this.createSpace,
    'realm.spaces.update-space': this.updateSpace,
    'realm.spaces.delete-space': this.deleteSpace,
    'realm.spaces.get-passports': this.getPassports,
  };

  static preload = {
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
    createSpace: (form: any) => {
      return ipcRenderer.invoke('realm.spaces.create-space', form);
    },
    updateSpace: (path: any, update: any) => {
      return ipcRenderer.invoke('realm.spaces.update-space', path, update);
    },
    deleteSpace: (path: any) => {
      return ipcRenderer.invoke('realm.spaces.delete-space', path);
    },
    getPassports: (path: any) => {
      return ipcRenderer.invoke('realm.spaces.get-passports', path);
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
        : {
            installed: [],
          }),
    };

    // Get the initial scry
    // TODO for some reason the initial selected reference is undefined so you cant
    // TODO reload to the same space you logged out from
    const spaces = await SpacesApi.getSpaces(this.core.conduit!);
    this.state!.initialScry(spaces, tempApps, persistedState);
    this.state!.selected &&
      this.core.services.desktop.setTheme(this.state!.selected?.theme);

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

  async createSpace(_event: any, body: any) {
    const members = body.members;
    delete body.members;
    const response = await SpacesApi.createSpace(
      this.core.conduit!,
      {
        slug: spaceToSnake(body.name),
        payload: snakeify({
          name: body.name,
          type: body.type,
          access: body.access,
          picture: body.picture,
          color: body.color,
          archetype: body.archetype,
        }),
        members,
      },
      this.core.credentials!
    );
    const newSpace = this.state!.addSpace(response);
    return toJS(newSpace);
  }

  updateSpace(_event: any, path: any, update: any) {
    console.log('update space: ', path);
  }

  async deleteSpace(_event: any, path: string) {
    console.log('deleting space: ', path);
    const response = await SpacesApi.deleteSpace(
      this.core.conduit!,
      { path },
      this.core.credentials!
    );
    const newSpace = this.state!.deleteSpace(response);
    return toJS(newSpace);
  }

  async getPassports(_event: any, path: string) {
    console.log(path);
    const response = await PassportsApi.getPassports(this.core.conduit!, path);
    console.log(response);
    return response;
  }

  setSelected(_event: any, path: string) {
    const selected = this.state?.selectSpace(path);
    this.core.services.desktop.setTheme(selected?.theme!);
  }

  async pinApp(_event: any, path: string, appId: string) {
    const space = this.state!.getSpaceByPath(path)!;
    console.log('pinning');
    console.log(space);
    space.pinApp(appId);
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
      const response = await SpacesApi.updateSpace(
        this.core.conduit!,
        { path: space.path, payload: { theme: snakeify(newTheme) } },
        this.core.credentials!
      );
      console.log('wallpaper set response, ', response);
      return newTheme;
    }
    // todo handle errors better
    return null;
  }
}
