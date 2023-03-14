import { ThemeModelType } from '../theme.model';
import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import { toJS } from 'mobx';
import fs from 'fs';
import path from 'path';
import { onPatch, getSnapshot } from 'mobx-state-tree';
import { Realm } from '../../index';
import { BaseService } from '../base.service';
import { SpacesStore, SpacesStoreType } from './models/spaces';
import { SpacesApi } from '../../api/spaces';
import { snakeify } from '../../lib/obj';
import { spaceToSnake } from '../../lib/text';
import { MemberRole, Patp, SpacePath } from '../../types';
import { VisaModel, VisaModelType } from './models/visas';
import { MembershipStore, MembershipType } from './models/members';
import { DiskStore } from '../base.store';
import { BazaarSubscriptions, BazaarApi } from '../../api/bazaar';
import { NewBazaarStore, NewBazaarStoreType } from './models/bazaar';
import { BeaconApi, BeaconInboxType } from '../../api/beacon';
import { formPathObj } from '../../lib/path';
import { BulletinApi } from '../../api/bulletin';
import { NotificationStore, NotificationStoreType } from './models/beacon';
import { BulletinStore, BulletinStoreType } from './models/bulletin';

export const getHost = (path: string) => path.split('/')[1];
let devApps: any = null;

// Loads the app.dev.json config file if it exists
if (fs.existsSync(path.resolve(__dirname, '../../../app.dev.json'))) {
  try {
    devApps = require(path.resolve(__dirname, '../../../app.dev.json'));
  } catch (err) {
    console.error('Failed to load dev apps', err);
  }
}

interface SpaceModels {
  bazaar: NewBazaarStoreType;
  membership: MembershipType;
  visas: VisaModelType;
  beacon: NotificationStoreType;
  bulletin: BulletinStoreType;
}
/**
 * SpacesService
 */
export class SpacesService extends BaseService {
  private db?: DiskStore; // for persistance
  private state?: SpacesStoreType; // for state management
  private models: SpaceModels = {
    membership: MembershipStore.create({}),
    visas: VisaModel.create({
      incoming: {},
      outgoing: {},
    }),
    bazaar: NewBazaarStore.create(),
    beacon: NotificationStore.create(),
    bulletin: BulletinStore.create(),
  };

  handlers = {
    'realm.spaces.set-selected': this.setSelected,
    'realm.spaces.create-space': this.createSpace,
    'realm.spaces.update-space': this.updateSpace,
    'realm.spaces.delete-space': this.deleteSpace,
    'realm.spaces.join-space': this.joinSpace,
    'realm.spaces.leave-space': this.leaveSpace,
    'realm.spaces.accept-invite': this.acceptInvite,
    'realm.spaces.decline-invite': this.declineInvite,
    'realm.bazaar.scryHash': this.scryHash,
    'realm.bazaar.scryTreaties': this.scryTreaties,
    'realm.bazaar.scryAllies': this.scryAllies,
    'realm.spaces.get-members': this.getMembers,
    'realm.spaces.get-invitations': this.getInvitations,
    'realm.spaces.set-loader': this.setLoader,
    'realm.spaces.set-join': this.setJoin,
    'realm.spaces.members.invite-member': this.inviteMember,
    'realm.spaces.members.kick-member': this.kickMember,
    'realm.spaces.members.set-roles': this.setRoles,
    'realm.spaces.bazaar.get-apps': this.getApps,
    'realm.spaces.bazaar.get-allies': this.getAllies,
    'realm.spaces.bazaar.get-treaties': this.getTreaties,
    'realm.spaces.bazaar.add-recent-app': this.addRecentApp,
    'realm.spaces.bazaar.add-recent-dev': this.addRecentDev,
    'realm.spaces.bazaar.pin-app': this.pinApp,
    'realm.spaces.bazaar.unpin-app': this.unpinApp,
    'realm.spaces.bazaar.set-pinned-order': this.setPinnedOrder,
    'realm.spaces.bazaar.recommend-app': this.recommendApp,
    'realm.spaces.bazaar.unrecommend-app': this.unrecommendApp,
    'realm.spaces.bazaar.suite-add': this.addToSuite,
    'realm.spaces.bazaar.suite-remove': this.removeFromSuite,
    'realm.spaces.bazaar.install-app-direct': this.installAppDirect,
    'realm.spaces.bazaar.install-app': this.installApp,
    'realm.spaces.bazaar.install-desk': this.installDesk,
    'realm.spaces.bazaar.new-installer': this.newInstaller,
    'realm.spaces.bazaar.uninstall-app': this.uninstallApp,
    'realm.spaces.bazaar.add-ally': this.addAlly,
    'realm.spaces.bazaar.add-app': this.addApp,
    'realm.spaces.bazaar.remove-app': this.removeApp,
    'realm.spaces.bazaar.suspend-app': this.suspendApp,
    'realm.spaces.bazaar.revive-app': this.reviveApp,
    'realm.spaces.beacon.saw-note': this.sawNote,
    'realm.spaces.beacon.saw-inbox': this.sawInbox,
  };

  static preload = {
    scryAllies: async () => await ipcRenderer.invoke('realm.bazaar.scryAllies'),
    scryTreaties: async (ship: Patp) =>
      await ipcRenderer.invoke('realm.bazaar.scryTreaties', ship),
    scryHash: (app: string) => ipcRenderer.invoke('realm.bazaar.scryHash', app),

    getOurGroups: async () => {
      return await ipcRenderer.invoke('realm.spaces.get-our-groups');
    },
    selectSpace: async (spaceId: string) => {
      return await ipcRenderer.invoke('realm.spaces.set-selected', spaceId);
    },
    pinApp: (path: string, appId: string, rank: number | null = null) => {
      ipcRenderer.invoke('realm.spaces.bazaar.pin-app', path, appId, rank);
    },
    unpinApp: (path: string, appId: string) => {
      ipcRenderer.invoke('realm.spaces.bazaar.unpin-app', path, appId);
    },
    recommendApp: async (appId: string) => {
      return await ipcRenderer.invoke(
        'realm.spaces.bazaar.recommend-app',
        appId
      );
    },
    unrecommendApp: async (appId: string) => {
      return await ipcRenderer.invoke(
        'realm.spaces.bazaar.unrecommend-app',
        appId
      );
    },
    setPinnedOrder: (path: string, newOrder: any[]) => {
      ipcRenderer.invoke(
        'realm.spaces.bazaar.set-pinned-order',
        path,
        newOrder
      );
    },
    createSpace: async (form: any) => {
      return await ipcRenderer.invoke('realm.spaces.create-space', form);
    },
    updateSpace: async (path: any, update: any) => {
      return ipcRenderer.invoke('realm.spaces.update-space', path, update);
    },
    deleteSpace: async (path: any) => {
      return await ipcRenderer.invoke('realm.spaces.delete-space', path);
    },
    joinSpace: async (path: any) => {
      return await ipcRenderer.invoke('realm.spaces.join-space', path);
    },
    leaveSpace: async (path: any) => {
      return await ipcRenderer.invoke('realm.spaces.leave-space', path);
    },
    getInvitations: async () => {
      return await ipcRenderer.invoke('realm.spaces.get-invitations');
    },
    setLoader: async (status: 'initial' | 'loading' | 'error' | 'loaded') => {
      return await ipcRenderer.invoke('realm.spaces.set-loader', status);
    },
    setJoin: async (status: 'initial' | 'loading' | 'error' | 'loaded') => {
      return await ipcRenderer.invoke('realm.spaces.set-join', status);
    },
    acceptInvite: async (path: any) => {
      return await ipcRenderer.invoke('realm.spaces.accept-invite', path);
    },
    declineInvite: async (path: any) => {
      return await ipcRenderer.invoke('realm.spaces.decline-invite', path);
    },
    getMembers: async (path: any) => {
      return await ipcRenderer.invoke('realm.spaces.get-members', path);
    },
    inviteMember: async (
      path: string,
      payload: { patp: string; role: MemberRole; message: string }
    ) =>
      await ipcRenderer.invoke(
        'realm.spaces.members.invite-member',
        path,
        payload
      ),
    kickMember: async (path: string, patp: string) =>
      await ipcRenderer.invoke('realm.spaces.members.kick-member', path, patp),
    setRoles: async (patp: string, roles: string[]) =>
      await ipcRenderer.invoke('realm.spaces.members.set-roles', patp, roles),
    getApps: async (path: SpacePath, tag: string = 'all') =>
      await ipcRenderer.invoke('realm.spaces.bazaar.get-apps', path, tag),
    getAllies: async (path: SpacePath) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.get-allies', path),
    getTreaties: async (patp: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.get-treaties', patp),
    addRecentApp: async (appId: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.add-recent-app', appId),
    addRecentDev: async (shipId: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.add-recent-dev', shipId),
    addToSuite: async (path: SpacePath, appId: string, index: number) =>
      await ipcRenderer.invoke(
        'realm.spaces.bazaar.suite-add',
        path,
        appId,
        index
      ),
    removeFromSuite: async (path: SpacePath, index: number) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.suite-remove', path, index),
    installDesk: async (ship: string, desk: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.install-desk', ship, desk),
    newInstaller: async (ship: string, desk: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.new-installer', ship, desk),
    installAppDirect: async (ship: string, desk: string) =>
      await ipcRenderer.invoke(
        'realm.spaces.bazaar.install-app-direct',
        ship,
        desk
      ),
    installApp: async (ship: string, desk: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.install-app', ship, desk),
    uninstallApp: async (desk: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.uninstall-app', desk),
    addAlly: async (ship: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.add-ally', ship),
    addApp: async (ship: string, desk: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.add-app', ship, desk),
    removeApp: async (appId: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.remove-app', appId),
    suspendApp: async (appId: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.suspend-app', appId),
    reviveApp: async (appId: string) =>
      await ipcRenderer.invoke('realm.spaces.bazaar.revive-app', appId),
    sawNote: async (noteId: string) =>
      await ipcRenderer.invoke('realm.spaces.beacon.saw-note', noteId),
    sawInbox: async (inbox: BeaconInboxType) =>
      await ipcRenderer.invoke('realm.spaces.beacon.saw-inbox', inbox),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
    this.setTheme = this.setTheme.bind(this);
  }

  get currentPath() {
    return this.state?.selected?.path;
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  get modelSnapshots() {
    return {
      membership: getSnapshot(this.models.membership),
      bazaar: getSnapshot(this.models.bazaar),
      visas: getSnapshot(this.models.visas),
      beacon: getSnapshot(this.models.beacon),
      bulletin: getSnapshot(this.models.bulletin),
    };
  }

  async load(patp: string, isReconnecting: boolean) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const secretKey = this.core.passwords.getPassword(patp);
    if (!secretKey) throw new Error('No password found for this ship');
    this.db = new DiskStore('spaces', patp, secretKey, SpacesStore);
    this.state = this.db.model as SpacesStoreType;
    if (!isReconnecting) this.state.setLoader('loading');
    // Load sub-models
    const membershipStore = new DiskStore(
      'membership',
      patp,
      secretKey,
      MembershipStore
    );
    const bazaarStore = new DiskStore(
      'bazaar',
      patp,
      secretKey,
      NewBazaarStore,
      {}
    );
    const beaconStore = new DiskStore(
      'beacon',
      patp,
      secretKey,
      NotificationStore,
      {}
    );
    const bulletinStore = new DiskStore(
      'bulletin',
      patp,
      secretKey,
      BulletinStore,
      {}
    );
    this.models.membership = membershipStore.model;
    this.models.bazaar = bazaarStore.model;
    this.models.bulletin = bulletinStore.model;
    if (devApps) {
      this.models.bazaar.loadDevApps(devApps);
    }
    this.models.beacon = beaconStore.model;
    this.models.beacon.load(this.core.conduit);
    // Set up patch for visas
    onPatch(this.models.visas, (patch) => {
      const patchEffect = {
        patch,
        resource: 'visas',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    SpacesApi.getInvitations(this.core.conduit).then((visas: any) => {
      this.models.visas.initialIncoming(visas);
    });

    // setting provider to current space host
    if (this.state.selected) {
      this.setTheme(this.state.selected.theme);
      this.core.services.ship.rooms.setProvider(
        getHost(this.state.selected.path)
      );
    }

    // initial sync effect
    const syncEffect = {
      model: {
        spaces: getSnapshot(this.state),
        membership: getSnapshot(this.models.membership),
        bazaar: getSnapshot(this.models.bazaar),
        beacon: getSnapshot(this.models.beacon),
        bulletin: getSnapshot(this.models.bulletin),
      },
      resource: 'spaces',
      key: null,
      response: 'initial',
    };

    this.core.onEffect(syncEffect);

    // Start patching after we've initialized the state
    this.db.registerPatches(this.core.onEffect);
    membershipStore.registerPatches(this.core.onEffect);
    bazaarStore.registerPatches(this.core.onEffect);
    beaconStore.registerPatches(this.core.onEffect);
    bulletinStore.registerPatches(this.core.onEffect);

    // Subscribe to sync updates
    SpacesApi.watchUpdates(
      this.core.conduit,
      this.state,
      this.models.membership,
      this.models.bazaar,
      this.models.visas,
      this.core.services.ship.rooms,
      this.setTheme
    );

    BulletinApi.watchUpdates(this.core.conduit, this.models.bulletin);

    BazaarSubscriptions.updates(this.core.conduit, this.models.bazaar);
    BeaconApi.watchUpdates(this.core.conduit, this.models.beacon);
  }

  // ***********************************************************
  // ************************ SPACES ***************************
  // ***********************************************************
  async createSpace(_event: IpcMainInvokeEvent, body: any) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const members = body.members;
    const id = spaceToSnake(body.name);
    const spacePath: SpacePath = await SpacesApi.createSpace(
      this.core.conduit,
      {
        slug: id,
        payload: snakeify({
          name: body.name,
          description: body.description,
          type: body.type,
          access: body.access,
          picture: body.image,
          color: body.color,
          archetype: body.archetype,
        }),
        members,
      }
    );
    this.core.services.shell.closeDialog(_event);
    this.core.services.shell.setBlur(_event, false);
    this.setSelected(_event, spacePath);
    return spacePath;
  }

  async updateSpace(_event: IpcMainInvokeEvent, path: any, body: any) {
    if (!this.core.conduit) throw new Error('No conduit found');
    SpacesApi.updateSpace(
      this.core.conduit,
      {
        payload: {
          name: body.name,
          description: body.description,
          access: body.access,
          picture: body.picture,
          color: body.color,
          theme: {
            mode: body.theme.mode,
            'background-color': body.theme.backgroundColor,
            'accent-color': body.theme.accentColor,
            'input-color': body.theme.inputColor,
            'dock-color': body.theme.dockColor,
            'icon-color': body.theme.iconColor,
            'text-color': body.theme.textColor,
            'window-color': body.theme.windowColor,
            wallpaper: body.theme.wallpaper,
          },
        },
        path: path,
      }
      //members,
    );
    this.core.services.shell.closeDialog(_event);
    this.core.services.shell.setBlur(_event, false);
    const selected = this.state?.selectSpace(path);
    if (selected) this.setTheme({ ...selected.theme, id: selected.path });
    return path;
  }

  async deleteSpace(_event: IpcMainInvokeEvent, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    // if we have the deleted path already selected
    if (path === this.state?.selected?.path) {
      const selected = this.state?.selectSpace(
        `/~${this.core.conduit?.ship}/our`
      );
      if (selected?.theme) this.setTheme(selected?.theme);
    }
    return await SpacesApi.deleteSpace(this.core.conduit, { path });
  }

  async joinSpace(_event: IpcMainInvokeEvent, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return SpacesApi.joinSpace(this.core.conduit, { path });
  }

  async leaveSpace(_event: IpcMainInvokeEvent, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await SpacesApi.leaveSpace(this.core.conduit, { path });
  }

  setSelected(_event: IpcMainInvokeEvent, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    // don't block for responsiveness, what about error handling?
    SpacesApi.setCurrentSpace(this.core.conduit, { path }).catch((e) => {
      console.error('Error setting current space', e);
    });
    const selected = this.state?.selectSpace(path);
    if (selected?.theme) this.setTheme(selected.theme);
    // setting provider to current space host
<<<<<<< HEAD
    console.log('selected', selected, path);
    const spaceHost = getHost(selected!.path);
=======
    const spaceHost = getHost(selected?.path ?? '');
>>>>>>> master
    this.core.services.ship.rooms.setProvider(spaceHost);
  }

  // ***********************************************************
  // *********************** MEMBERS ***************************
  // ***********************************************************
  async getMembers(_event: IpcMainInvokeEvent, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await SpacesApi.getMembers(this.core.conduit, path);
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
    if (!this.core.conduit) throw new Error('No conduit found');
    const response = await SpacesApi.inviteMember(
      this.core.conduit,
      path,
      payload
    );

    return response;
  }

  async kickMember(_event: IpcMainInvokeEvent, path: string, patp: Patp) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await SpacesApi.kickMember(this.core.conduit, path, patp);
  }

  async setRoles(_event: IpcMainInvokeEvent, patp: Patp, roles: string[]) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await SpacesApi.setRoles(
      this.core.conduit,
      this.state?.selected?.path ?? '',
      patp,
      roles
    );
  }

  async getInvitations(_event: IpcMainInvokeEvent) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await SpacesApi.getInvitations(this.core.conduit);
  }

  async setLoader(
    _event: IpcMainInvokeEvent,
    status: 'initial' | 'loading' | 'error' | 'loaded'
  ) {
    this.state?.setLoader(status);
  }

  async setJoin(
    _event: IpcMainInvokeEvent,
    status: 'initial' | 'loading' | 'error' | 'loaded'
  ) {
    this.state?.setJoin(status);
  }

  async acceptInvite(_event: IpcMainInvokeEvent, path: string) {
    if (!this.state) throw new Error('No state found');
    if (!this.core.conduit) throw new Error('No conduit found');
    return await SpacesApi.acceptInvite(
      this.core.conduit,
      path,
      this.models.membership,
      this.state
    );
  }

  async declineInvite(_event: IpcMainInvokeEvent, path: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    await SpacesApi.declineInvite(this.core.conduit, path);
    this.models.visas?.removeIncoming(path);
  }

  setTheme(theme: ThemeModelType) {
    this.core.mainWindow.webContents.send('realm.change-theme', toJS(theme));
  }
  // // ***********************************************************
  // // *********************** FRIENDS ***************************
  // // ***********************************************************
  // async getFriends(_event: IpcMainInvokeEvent) {
  //   return await FriendsApi.getFriends(this.core.conduit);
  // }
  // //
  // async addFriend(_event: IpcMainInvokeEvent, patp: Patp) {
  //   return await FriendsApi.addFriend(this.core.conduit, patp);
  // }
  // //
  // async editFriend(
  //   _event: IpcMainInvokeEvent,
  //   patp: Patp,
  //   payload: { pinned: boolean; tags: string[] }
  // ) {
  //   return await FriendsApi.editFriend(this.core.conduit, patp, payload);
  // }
  // async removeFriend(_event: IpcMainInvokeEvent, patp: Patp) {
  //   return await FriendsApi.removeFriend(this.core.conduit, patp);
  // }
  //

  // ***********************************************************
  // ************************ BAZAAR ***************************
  // ***********************************************************

  async getApps(_event: IpcMainInvokeEvent, path: SpacePath, tag: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return BazaarApi.getApps(this.core.conduit, path, tag);
  }

  async getAllies(_event: IpcMainInvokeEvent, path: SpacePath) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return BazaarApi.getAllies(this.core.conduit, path);
  }

  async getTreaties(_event: IpcMainInvokeEvent, patp: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return BazaarApi.getTreaties(this.core.conduit, patp);
  }

  async addRecentApp(_event: IpcMainInvokeEvent, appId: string) {
    return this.models.bazaar.addRecentApp(appId);
  }

  async addRecentDev(_event: IpcMainInvokeEvent, shipId: string) {
    return this.models.bazaar.addRecentDev(shipId);
  }

  async pinApp(
    _event: IpcMainInvokeEvent,
    path: SpacePath,
    appId: string,
    index: number | null
  ) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.pinApp(this.core.conduit, {
      path: formPathObj(path),
      'app-id': appId,
      index,
    });
  }

  async unpinApp(_event: IpcMainInvokeEvent, path: SpacePath, appId: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.unpinApp(this.core.conduit, {
      path: formPathObj(path),
      'app-id': appId,
    });
  }

  async recommendApp(_event: IpcMainInvokeEvent, appId: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.recommendApp(this.core.conduit, appId);
  }

  async unrecommendApp(_event: IpcMainInvokeEvent, appId: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.unrecommendApp(this.core.conduit, appId);
  }

  async scryHash(_event: IpcMainInvokeEvent, app: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.scryHash(this.core.conduit, app);
  }

  async scryTreaties(_event: IpcMainInvokeEvent, ship: Patp) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.scryTreaties(this.core.conduit, ship);
  }

  async scryAllies(_event: IpcMainInvokeEvent) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.scryAllies(this.core.conduit);
  }

  async addToSuite(
    _event: IpcMainInvokeEvent,
    path: SpacePath,
    appId: string,
    index: number
  ) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.addToSuite(this.core.conduit, {
      path: formPathObj(path),
      'app-id': appId,
      index,
    });
  }

  async removeFromSuite(
    _event: IpcMainInvokeEvent,
    path: SpacePath,
    index: number
  ) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.removeFromSuite(this.core.conduit, {
      path: formPathObj(path),
      index,
    });
  }

  async installDesk(_event: IpcMainInvokeEvent, _ship: string, _desk: string) {
    // return await BazaarApi.installDesk(this.core.conduit, ship, desk);
  }

  async newInstaller(_event: IpcMainInvokeEvent, _ship: string, _desk: string) {
    // return await BazaarApi.newInstaller(
    //   this.core.conduit,
    //   ship,
    //   desk,
    //   this.models.bazaar
    // );
  }

  async installAppDirect(
    _event: IpcMainInvokeEvent,
    ship: string,
    desk: string
  ) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.installAppDirect(this.core.conduit, {
      ship,
      desk,
    });
  }

  async installApp(_event: IpcMainInvokeEvent, ship: string, desk: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.installApp(this.core.conduit, {
      ship,
      desk,
    });
  }

  async uninstallApp(_event: IpcMainInvokeEvent, desk: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.uninstallApp(this.core.conduit, { desk });
  }
  async suspendApp(_event: IpcMainInvokeEvent, desk: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.suspendApp(this.core.conduit, desk);
  }
  async reviveApp(_event: IpcMainInvokeEvent, desk: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.reviveApp(this.core.conduit, desk);
  }
  async addAlly(_event: IpcMainInvokeEvent, ship: Patp) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.bazaar.addAlly(this.core.conduit, ship);
  }

  async addApp(_event: IpcMainInvokeEvent, _ship: string, _desk: string) {
    // return await BazaarApi.addApp(this.core.conduit, ship, desk);
  }

  async removeApp(_event: IpcMainInvokeEvent, _appId: string) {
    // return await BazaarApi.removeApp(this.core.conduit, appId);
  }

  setPinnedOrder(_event: IpcMainInvokeEvent, path: string, order: string[]) {
    if (!this.core.conduit) throw new Error('No conduit found');
    this.models.bazaar.reorderPinnedApps(this.core.conduit, {
      path: formPathObj(path),
      dock: order,
    });
  }

  async sawNote(_event: IpcMainInvokeEvent, noteId: string) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.beacon.notes
      ?.get(noteId)
      ?.markSeen(this.core.conduit);
    // return await BeaconApi.sawNote(this.core.conduit, noteId);
  }
  async sawInbox(_event: IpcMainInvokeEvent, inbox: BeaconInboxType) {
    if (!this.core.conduit) throw new Error('No conduit found');
    return await this.models.beacon.sawInbox(this.core.conduit, inbox);
  }

  setSpaceWallpaper(spacePath: string, theme: any) {
    if (!this.core.conduit) throw new Error('No conduit found');
    const space = this.state?.getSpaceByPath(spacePath);

    if (!space) throw new Error(`Space ${spacePath} not found`);

    space.theme.setTheme(theme);

    delete theme.id;
    SpacesApi.updateSpace(this.core.conduit, {
      path: space.path,
      payload: {
        name: space.name,
        description: space.description,
        access: space.access,
        picture: space.picture,
        color: space.color,
        theme: snakeify(theme),
      },
    });
  }
}
