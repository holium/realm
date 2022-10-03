import { ThemeModelType } from '../theme.model';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  ModelSnapshotType,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { SpacesStore, SpacesStoreType } from './models/spaces';
import { ShipModelType } from '../ship/models/ship';
import { SpacesApi } from '../../api/spaces';
import { snakeify, camelToSnake } from '../../lib/obj';
import { spaceToSnake } from '../../lib/text';
import { MemberRole, Patp, SpacePath } from 'os/types';
import { BazaarApi } from '../../api/bazaar';
import { VisaModel, VisaModelType } from './models/visas';
import { loadMembersFromDisk } from './passports';
import { loadBazaarFromDisk } from './bazaar';
import { RoomsApi } from '../../api/rooms';

const getHost = (path: string) => path.split('/')[1];
import { BazaarStore } from './models/bazaar';
import { MembershipStore } from './models/members';

type SpaceModels = {
  bazaar: any;
  membership: any;
  visas: VisaModelType;
  // friends: FriendsType;
};
/**
 * SpacesService
 */
export class SpacesService extends BaseService {
  private db?: Store<SpacesStoreType>; // for persistance
  private state?: SpacesStoreType; // for state management
  private models: SpaceModels = {
    membership: MembershipStore.create({}),
    visas: VisaModel.create({
      incoming: {},
      outgoing: {},
    }),
    bazaar: BazaarStore.create({ my: {} }),
  };

  handlers = {
    'realm.spaces.set-selected': this.setSelected,
    'realm.spaces.create-space': this.createSpace,
    'realm.spaces.update-space': this.updateSpace,
    'realm.spaces.delete-space': this.deleteSpace,
    'realm.spaces.accept-invite': this.acceptInvite,
    'realm.spaces.decline-invite': this.declineInvite,
    'realm.spaces.get-members': this.getMembers,
    'realm.spaces.get-invitations': this.getInvitations,
    'realm.spaces.members.invite-member': this.inviteMember,
    'realm.spaces.members.kick-member': this.kickMember,
    'realm.spaces.bazaar.get-apps': this.getApps,
    'realm.spaces.bazaar.get-allies': this.getAllies,
    'realm.spaces.bazaar.get-treaties': this.getTreaties,
    'realm.spaces.bazaar.add-recent-app': this.addRecentApp,
    'realm.spaces.bazaar.get-recent-apps': this.getRecentApps,
    'realm.spaces.bazaar.add-recent-dev': this.addRecentDev,
    'realm.spaces.bazaar.get-recent-devs': this.getRecentDevs,
    'realm.spaces.bazaar.pin-app': this.pinApp,
    'realm.spaces.bazaar.unpin-app': this.unpinApp,
    'realm.spaces.bazaar.set-pinned-order': this.setPinnedOrder,
    'realm.spaces.bazaar.recommend-app': this.recommendApp,
    'realm.spaces.bazaar.unrecommend-app': this.unrecommendApp,
    'realm.spaces.bazaar.suite-add': this.addToSuite,
    'realm.spaces.bazaar.suite-remove': this.removeFromSuite,
    'realm.spaces.bazaar.install-app': this.installApp,
    'realm.spaces.bazaar.install-desk': this.installDesk,
    'realm.spaces.bazaar.uninstall-app': this.uninstallApp,
    'realm.spaces.bazaar.add-ally': this.addAlly,
  };

  static preload = {
    getOurGroups: () => {
      return ipcRenderer.invoke('realm.spaces.get-our-groups');
    },
    selectSpace: (spaceId: string) => {
      return ipcRenderer.invoke('realm.spaces.set-selected', spaceId);
    },
    pinApp: (path: string, appId: string, rank: number | null = null) => {
      return ipcRenderer.invoke(
        'realm.spaces.bazaar.pin-app',
        path,
        appId,
        rank
      );
    },
    unpinApp: (path: string, appId: string) => {
      return ipcRenderer.invoke('realm.spaces.bazaar.unpin-app', path, appId);
    },
    recommendApp: (path: string, appId: string) => {
      return ipcRenderer.invoke(
        'realm.spaces.bazaar.recommend-app',
        path,
        appId
      );
    },
    unrecommendApp: (path: string, appId: string) => {
      return ipcRenderer.invoke(
        'realm.spaces.bazaar.unrecommend-app',
        path,
        appId
      );
    },
    setPinnedOrder: (path: string, newOrder: any[]) => {
      return ipcRenderer.invoke(
        'realm.spaces.bazaar.set-pinned-order',
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
    getInvitations: () => {
      return ipcRenderer.invoke('realm.spaces.get-invitations');
    },
    acceptInvite: async (path: any) => {
      return ipcRenderer.invoke('realm.spaces.accept-invite', path);
    },
    declineInvite: async (path: any) => {
      return ipcRenderer.invoke('realm.spaces.decline-invite', path);
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
    //
    getApps: async (path: SpacePath, tag: string = 'all') =>
      ipcRenderer.invoke('realm.spaces.bazaar.get-apps', path, tag),
    getAllies: async (path: SpacePath) =>
      ipcRenderer.invoke('realm.spaces.bazaar.get-allies', path),
    getTreaties: async (patp: string) =>
      ipcRenderer.invoke('realm.spaces.bazaar.get-treaties', patp),
    getRecentApps: async () =>
      ipcRenderer.invoke('realm.spaces.bazaar.get-recent-apps'),
    addRecentApp: async (path: SpacePath, appId: string) =>
      ipcRenderer.invoke('realm.spaces.bazaar.add-recent-app', path, appId),
    getRecentDevs: async () =>
      ipcRenderer.invoke('realm.spaces.bazaar.get-recent-devs'),
    addRecentDev: async () =>
      ipcRenderer.invoke('realm.spaces.bazaar.add-recent-dev'),
    addToSuite: async (path: SpacePath, appId: string, rank: number) =>
      ipcRenderer.invoke('realm.spaces.bazaar.suite-add', path, appId, rank),
    removeFromSuite: async (path: SpacePath, appId: string) =>
      ipcRenderer.invoke('realm.spaces.bazaar.suite-remove', path, appId),
    installDesk: async (ship: string, desk: string) =>
      ipcRenderer.invoke('realm.spaces.bazaar.install-desk', ship, desk),
    installApp: async (app: any) =>
      ipcRenderer.invoke('realm.spaces.bazaar.install-app', app),
    uninstallApp: async (desk: string) =>
      ipcRenderer.invoke('realm.spaces.bazaar.uninstall-app', desk),
    addAlly: async (ship: string) =>
      ipcRenderer.invoke('realm.spaces.bazaar.add-ally', ship),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
    this.setTheme = this.setTheme.bind(this);
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  get modelSnapshots() {
    return {
      membership: getSnapshot(this.models.membership),
      bazaar: getSnapshot(this.models.bazaar),
      visas: getSnapshot(this.models.visas),
    };
  }

  async load(patp: string, docket: any) {
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
    // Set up patch for visas
    onPatch(this.models.visas, (patch) => {
      const patchEffect = {
        patch,
        resource: 'visas',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    SpacesApi.getInvitations(this.core.conduit!).then((visas: any) => {
      this.models.visas.initialIncoming(visas);
    });
    // Temporary setup
    // this.models.bazaar.our(`/${patp}/our`, getSnapshot(ship.docket.apps) || {});

    // Get the initial scry
    const spaces = await SpacesApi.getSpaces(this.core.conduit!);
    this.state!.initialScry(spaces, persistedState, patp);
    this.state!.selected && this.setTheme(this.state!.selected?.theme);

    this.state.setLoader('loaded');
    // initial sync effect
    const syncEffect = {
      model: {
        spaces: getSnapshot(this.state!),
        membership: getSnapshot(this.models.membership),
        bazaar: getSnapshot(this.models.bazaar),
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
      this.models.membership,
      this.models.bazaar,
      this.models.visas,
      this.setTheme
    );
    // Subscribe to sync updates
    // BazaarApi.loadTreaties(this.core.conduit!, this.models.bazaar);
    // BazaarApi.watchUpdates(this.core.conduit!, this.models.bazaar);
    //
    // setting provider to current space host
    this.core.services.ship.rooms!.setProvider(
      null,
      getHost(this.state.selected!.path)
    );
    BazaarApi.initialize(this.core.conduit!, this.models.bazaar);
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
    this.setTheme({ ...selected!.theme!, id: selected!.path });
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
      this.setTheme(selected?.theme!);
    }
    return await SpacesApi.deleteSpace(this.core.conduit!, { path });
  }

  setSelected(_event: IpcMainInvokeEvent, path: string) {
    const selected = this.state?.selectSpace(path);
    this.setTheme(selected?.theme!);
    // const currentRoomProvider = this.core.services.ship.rooms?.state?.provider;
    // setting provider to current space host
    const spaceHost = getHost(this.state!.selected!.path);
    // if (currentRoomProvider !== spaceHost)
    this.core.services.ship.rooms!.setProvider(null, spaceHost);
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
    const response = await SpacesApi.inviteMember(
      this.core.conduit!,
      path,
      payload
    );

    return response;
  }

  async kickMember(_event: IpcMainInvokeEvent, path: string, patp: Patp) {
    return await SpacesApi.kickMember(this.core.conduit!, path, patp);
  }

  async getInvitations(_event: IpcMainInvokeEvent) {
    return await SpacesApi.getInvitations(this.core.conduit!);
  }

  async acceptInvite(_event: IpcMainInvokeEvent, path: string) {
    return await SpacesApi.acceptInvite(
      this.core.conduit!,
      path,
      this.models.membership,
      this.state!
    );
  }

  async declineInvite(_event: IpcMainInvokeEvent, path: string) {
    await SpacesApi.declineInvite(this.core.conduit!, path);
    this.models.visas?.removeIncoming(path);
    return;
  }

  setTheme(theme: ThemeModelType) {
    this.core.mainWindow.webContents.send('realm.change-theme', toJS(theme));
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
  //

  // ***********************************************************
  // ************************ BAZAAR ***************************
  // ***********************************************************

  async getApps(_event: IpcMainInvokeEvent, path: SpacePath, tag: string) {
    return await BazaarApi.getApps(this.core.conduit!, path, tag);
  }
  async getAllies(_event: IpcMainInvokeEvent, path: SpacePath) {
    return await BazaarApi.getAllies(this.core.conduit!, path);
  }
  async getTreaties(_event: IpcMainInvokeEvent, patp: string) {
    return await BazaarApi.getTreaties(this.core.conduit!, patp);
  }
  async getRecentApps(_event: IpcMainInvokeEvent) {
    return this.models.bazaar.getRecentApps();
  }
  async addRecentApp(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string
  ) {
    // console.log('addRecentApp => %o', { spacePath, appId });
    return this.models.bazaar.getBazaar(spacePath).addRecentApp(appId);
  }
  async addRecentDev(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    shipId: string
  ) {
    return this.models.bazaar.getBazaar(spacePath).addRecentDev(shipId);
  }
  async getRecentDevs(_event: IpcMainInvokeEvent) {
    return this.models.bazaar.getRecentDevs();
  }

  async pinApp(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string,
    rank: number | null
  ) {
    return await BazaarApi.pinApp(this.core.conduit!, spacePath, appId, rank);
  }

  async unpinApp(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string
  ) {
    return await BazaarApi.unpinApp(this.core.conduit!, spacePath, appId);
  }

  async recommendApp(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string
  ) {
    return await BazaarApi.recommendApp(this.core.conduit!, spacePath, appId);
  }

  async unrecommendApp(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string
  ) {
    return await BazaarApi.unrecommendApp(this.core.conduit!, spacePath, appId);
  }

  async addToSuite(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string,
    rank: number
  ) {
    return await BazaarApi.addToSuite(
      this.core.conduit!,
      spacePath,
      appId,
      rank
    );
  }

  async removeFromSuite(
    _event: IpcMainInvokeEvent,
    spacePath: SpacePath,
    appId: string
  ) {
    return await BazaarApi.removeFromSuite(
      this.core.conduit!,
      spacePath,
      appId
    );
  }

  async installDesk(_event: IpcMainInvokeEvent, ship: string, desk: string) {
    return await BazaarApi.installDesk(this.core.conduit!, ship, desk);
  }

  async installApp(_event: IpcMainInvokeEvent, app: any) {
    return await BazaarApi.resolveAppInstall(this.core.conduit!, app);
  }

  async uninstallApp(_event: IpcMainInvokeEvent, desk: string) {
    return await BazaarApi.uninstallApp(this.core.conduit!, desk);
  }

  async addAlly(_event: IpcMainInvokeEvent, ship: any) {
    return await BazaarApi.addAlly(this.core.conduit!, ship);
  }

  async setPinnedOrder(_event: IpcMainInvokeEvent, path: string, order: any[]) {
    return await BazaarApi.setPinnedOrder(this.core.conduit!, path, order);
    // this.models.bazaar.getBazaar(path).setPinnedOrder(order);
  }

  setSpaceWallpaper(spacePath: string, theme: any) {
    const space = this.state!.getSpaceByPath(spacePath)!;

    space.theme!.setTheme(theme);
    // @ts-ignore
    delete theme.id;
    SpacesApi.updateSpace(this.core.conduit!, {
      path: space.path,
      payload: { theme: snakeify(theme) },
    });
    return;
  }
}
