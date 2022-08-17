import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { SpacesStore, SpacesStoreType } from './models/spaces';
import { ShipModelType } from '../ship/models/ship';
import { SpacesApi } from '../../api/spaces';
import { snakeify, camelToSnake } from '../../lib/obj';
import { spaceToSnake } from '../../lib/text';
import { MemberRole, Patp, SpacePath } from 'os/types';
import { PassportsApi } from '../../api/passports';
import { BazaarApi } from '../../api/bazaar';
import { InvitationsModel } from './models/invitations';
import { loadMembersFromDisk } from './passports';
import { loadBazaarFromDisk } from './bazaar';

type SpaceModels = {
  bazaar?: any;
  membership?: any;
  invitations?: any;
  // friends: FriendsType;
};
/**
 * SpacesService
 */
export class SpacesService extends BaseService {
  private db?: Store<SpacesStoreType>; // for persistance
  private state?: SpacesStoreType; // for state management
  private models: SpaceModels = {
    invitations: InvitationsModel.create({
      outgoing: {},
      incoming: {},
    }),
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
    'realm.spaces.members.invite-member': this.inviteMember,
    'realm.spaces.members.kick-member': this.kickMember,
    'realm.spaces.bazaar.get-apps': this.getApps,
    'realm.spaces.bazaar.get-allies': this.getAllies,
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
    setPinnedOrder: (path: string, newOrder: any[]) => {
      return ipcRenderer.invoke(
        'realm.spaces.set-pinned-order',
        path,
        newOrder
      );
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
    inviteMember: async (
      path: string,
      payload: { patp: string; role: MemberRole; message: string }
    ) =>
      ipcRenderer.invoke('realm.spaces.members.invite-member', path, payload),
    //
    kickMember: async (path: string, patp: string) =>
      ipcRenderer.invoke('realm.spaces.members.kick-member', path, patp),
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

  get bazaarSnapshot() {
    return this.models.bazaar ? getSnapshot(this.models.bazaar) : null;
  }

  get membershipSnapshot() {
    return this.models.membership ? getSnapshot(this.models.membership) : null;
  }

  async load(patp: string, ship: ShipModelType) {
    this.db = new Store({
      name: 'spaces',
      cwd: `realm.${patp}`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: SpacesStoreType = this.db.store;
    this.state = SpacesStore.create(castToSnapshot(persistedState));
    // Load sub-models
    this.models.membership = loadMembersFromDisk(patp, this.core.onEffect);
    this.models.bazaar = loadBazaarFromDisk(patp, this.core.onEffect);
    // Temporary setup
    this.models.bazaar.our(`/${patp}/our`, getSnapshot(ship.docket.apps) || {});

    // Get the initial scry
    const spaces = await SpacesApi.getSpaces(this.core.conduit!);
    this.state!.initialScry(spaces, persistedState, patp);
    this.state!.selected &&
      this.core.services.desktop.setTheme(this.state!.selected?.theme);

    this.state.setLoader('loaded');
    // initial sync effect
    const syncEffect = {
      model: {
        spaces: getSnapshot(this.state!),
        membership: getSnapshot(this.models.membership),
      },
      resource: 'spaces',
      key: null,
      response: 'initial',
    };

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
    SpacesApi.watchUpdates(
      this.core.conduit!,
      this.state,
      this.models.membership
    );
    PassportsApi.watchMembers(this.core.conduit!, this.models.membership);
  }
  // ***********************************************************
  // ************************ SPACES ***************************
  // ***********************************************************
  async createSpace(_event: IpcMainInvokeEvent, body: any) {
    const members = body.members;
    const spacePath: SpacePath = await SpacesApi.createSpace(
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
      }
    );
    this.core.services.shell.closeDialog(_event);
    this.core.services.shell.setBlur(_event, false);
    const selected = this.state?.selectSpace(spacePath);
    this.core.services.desktop.setTheme(selected?.theme!);
    return spacePath;
  }

  updateSpace(_event: IpcMainInvokeEvent, path: any, update: any) {
    console.log('update space: ', path);
  }

  async deleteSpace(_event: IpcMainInvokeEvent, path: string) {
    // if we have the deleted path already selected
    if (path === this.state?.selected?.path) {
      const selected = this.state?.selectSpace(
        `/~${this.core.conduit?.ship}/our`
      );
      this.core.services.desktop.setTheme(selected?.theme!);
    }
    return await SpacesApi.deleteSpace(this.core.conduit!, { path });
  }

  setSelected(_event: IpcMainInvokeEvent, path: string) {
    const selected = this.state?.selectSpace(path);
    this.core.services.desktop.setTheme(selected?.theme!);
  }
  // ***********************************************************
  // *********************** MEMBERS ***************************
  // ***********************************************************
  async getMembers(_event: IpcMainInvokeEvent, path: string) {
    return await PassportsApi.getMembers(this.core.conduit!, path);
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
    const response = await PassportsApi.inviteMember(
      this.core.conduit!,
      path,
      payload
    );

    return response;
  }

  async kickMember(_event: IpcMainInvokeEvent, path: string, patp: Patp) {
    return await PassportsApi.kickMember(this.core.conduit!, path, patp);
  }

  // // ***********************************************************
  // // *********************** FRIENDS ***************************
  // // ***********************************************************
  // async getFriends(_event: IpcMainInvokeEvent) {
  //   return await FriendsApi.getFriends(this.core.conduit!);
  // }
  // //
  // async addFriend(_event: IpcMainInvokeEvent, patp: Patp) {
  //   return await FriendsApi.addFriend(this.core.conduit!, patp);
  // }
  // //
  // async editFriend(
  //   _event: IpcMainInvokeEvent,
  //   patp: Patp,
  //   payload: { pinned: boolean; tags: string[] }
  // ) {
  //   return await FriendsApi.editFriend(this.core.conduit!, patp, payload);
  // }
  // async removeFriend(_event: IpcMainInvokeEvent, patp: Patp) {
  //   return await FriendsApi.removeFriend(this.core.conduit!, patp);
  // }
  // ***********************************************************
  // ************************ BAZAAR ***************************
  // ***********************************************************
  async getApps(_event: IpcMainInvokeEvent, path: SpacePath) {
    const apps = await BazaarApi.getApps(this.core.conduit!, path);
    this.state.models.apps(path, apps);
    return apps;
  }
  async getAllies(_event: IpcMainInvokeEvent, path: SpacePath) {
    return await BazaarApi.getAllies(this.core.conduit!, path);
  }

  async pinApp(_event: IpcMainInvokeEvent, path: string, appId: string) {
    console.log('pinning');
    console.log(path);
    console.log(this.models.bazaar.getBazaar(path));
    this.models.bazaar.getBazaar(path).pinApp(appId);
    return;
  }

  async unpinApp(_event: IpcMainInvokeEvent, path: string, appId: string) {
    console.log(path);
    console.log(this.models.bazaar.getBazaar(path));
    this.models.bazaar.getBazaar(path).unpinApp(appId);
    return;
  }

  setPinnedOrder(_event: IpcMainInvokeEvent, path: string, order: any[]) {
    this.models.bazaar.getBazaar(path).setPinnedOrder(order);
  }

  setSpaceWallpaper(spacePath: string, color: string, wallpaper: string) {
    const space = this.state!.getSpaceByPath(spacePath)!;

    const newTheme = space.theme!.setWallpaper(spacePath, color, wallpaper);
    SpacesApi.updateSpace(this.core.conduit!, {
      path: space.path,
      payload: { theme: snakeify(newTheme) },
    });
    return newTheme;
  }
}
