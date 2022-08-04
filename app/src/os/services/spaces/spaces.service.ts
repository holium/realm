import { PassportsApi } from './../../api/passports';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  clone,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { DocketMap, SpacesStore, SpacesStoreType } from './models/spaces';

import { ShipModelType } from '../ship/models/ship';
import { SpacesApi } from '../../api/spaces';
import { snakeify, camelToSnake } from '../../lib/obj';
import { spaceToSnake } from '../../lib/text';
import { MemberRole, Patp } from 'os/types';
import { FriendsApi } from '../../api/friends';

type SpaceModels = {
  bazaar?: any;
  passports?: any;
};
/**
 * SpacesService
 */
export class SpacesService extends BaseService {
  private db?: Store<SpacesStoreType>; // for persistance
  private state?: SpacesStoreType; // for state management
  private models: SpaceModels = {
    bazaar: undefined,
    passports: undefined,
  };
  handlers = {
    'realm.spaces.set-selected': this.setSelected,
    'realm.spaces.pin-app': this.pinApp,
    'realm.spaces.unpin-app': this.unpinApp,
    'realm.spaces.set-pinned-order': this.setPinnedOrder,
    'realm.spaces.create-space': this.createSpace,
    'realm.spaces.update-space': this.updateSpace,
    'realm.spaces.delete-space': this.deleteSpace,
    'realm.spaces.get-members': this.getMembers,
    'realm.spaces.get-friends': this.getFriends,
    'realm.spaces.add-friend': this.addFriend,
    'realm.spaces.edit-friend': this.editFriend,
    'realm.spaces.remove-friend': this.removeFriend,
    'realm.spaces.invite-member': this.inviteMember,
    'realm.spaces.kick-member': this.kickMember,
  };

  static preload = {
    getOurGroups: () => {
      return ipcRenderer.invoke('realm.spaces.get-our-groups');
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
    createSpace: (form: any) => {
      return ipcRenderer.invoke('realm.spaces.create-space', form);
    },
    updateSpace: (path: any, update: any) => {
      return ipcRenderer.invoke('realm.spaces.update-space', path, update);
    },
    deleteSpace: (path: any) => {
      return ipcRenderer.invoke('realm.spaces.delete-space', path);
    },
    getMembers: (path: any) => {
      return ipcRenderer.invoke('realm.spaces.get-members', path);
    },
    getFriends: () => {
      return ipcRenderer.invoke('realm.spaces.get-friends');
    },
    inviteMember: async (
      path: string,
      payload: { patp: string; role: MemberRole; message: string }
    ) => ipcRenderer.invoke('realm.spaces.invite-member', path, payload),
    kickMember: async (path: string, patp: string) =>
      ipcRenderer.invoke('realm.spaces.kick-member', path, patp),
    addFriend: async (patp: Patp) =>
      ipcRenderer.invoke('realm.spaces.add-friend', patp),
    //
    editFriend: async (
      patp: Patp,
      payload: { pinned: boolean; tags: string[] }
    ) => ipcRenderer.invoke('realm.spaces.edit-friend', patp, payload),
    //
    removeFriend: async (patp: Patp) =>
      ipcRenderer.invoke('realm.spaces.remove-friend', patp),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    // this.friends = new FriendsService(core.conduit!);

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
    SpacesApi.watchUpdates(this.core.conduit!, this.state);
    // PassportsApi.syncUpdates(this.core.conduit!, this.state);
    FriendsApi.watchFriends(this.core.conduit!, this.state);
  }
  // ***********************************************************
  // ************************ SPACES ***************************
  // ***********************************************************
  async createSpace(_event: IpcMainInvokeEvent, body: any) {
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

  updateSpace(_event: IpcMainInvokeEvent, path: any, update: any) {
    console.log('update space: ', path);
  }

  async deleteSpace(_event: IpcMainInvokeEvent, path: string) {
    console.log('deleting space: ', path);
    const response = await SpacesApi.deleteSpace(
      this.core.conduit!,
      { path },
      this.core.credentials!
    );
    const newSpace = this.state!.deleteSpace(response);
    return toJS(newSpace);
  }

  setSelected(_event: IpcMainInvokeEvent, path: string) {
    const selected = this.state?.selectSpace(path);
    this.core.services.shell.setTheme(selected?.theme!);
  }
  // ***********************************************************
  // *********************** MEMBERS ***************************
  // ***********************************************************
  async getMembers(_event: IpcMainInvokeEvent, path: string) {
    return await SpacesApi.getMembers(this.core.conduit!, path);
  }

  async inviteMember(
    _event: IpcMainInvokeEvent,
    path: string,
    payload: {
      patp: Patp;
      role: MemberRole;
      message: string;
    }
  ) {
    const response = await SpacesApi.sendInvite(
      this.core.conduit!,
      path,
      payload,
      this.core.credentials!
    );

    return response;
  }

  async kickMember(_event: IpcMainInvokeEvent, path: string, patp: Patp) {
    const response = await SpacesApi.kickMember(
      this.core.conduit!,
      path,
      patp,
      this.core.credentials!
    );

    return response;
  }
  // ***********************************************************
  // *********************** FRIENDS ***************************
  // ***********************************************************
  async getFriends(_event: IpcMainInvokeEvent) {
    return await FriendsApi.getFriends(this.core.conduit!);
  }
  async addFriend(_event: IpcMainInvokeEvent, patp: Patp) {
    return await FriendsApi.addFriend(this.core.conduit!, patp);
  }
  async editFriend(
    _event: IpcMainInvokeEvent,
    patp: Patp,
    payload: { pinned: boolean; tags: string[] }
  ) {
    return await FriendsApi.editFriend(this.core.conduit!, patp, payload);
  }
  async removeFriend(_event: IpcMainInvokeEvent, patp: Patp) {
    return await FriendsApi.removeFriend(this.core.conduit!, patp);
  }
  // ***********************************************************
  // ************************ BAZAAR ***************************
  // ***********************************************************
  async pinApp(_event: IpcMainInvokeEvent, path: string, appId: string) {
    const space = this.state!.getSpaceByPath(path)!;
    console.log('pinning');
    console.log(space);
    space.pinApp(appId);
    return;
  }

  async unpinApp(_event: IpcMainInvokeEvent, path: string, appId: string) {
    this.state?.selected?.unpinApp(appId);
    return;
  }

  setPinnedOrder(_event: IpcMainInvokeEvent, order: any[]) {
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
