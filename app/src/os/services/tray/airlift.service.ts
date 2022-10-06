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
import { SpacesApi } from '../../api/spaces';
import { snakeify, camelToSnake } from '../../lib/obj';
import { spaceToSnake } from '../../lib/text';
import { MemberRole, Patp, SpacePath } from 'os/types';
import { AirliftStore, AirliftStoreType } from './airlift.model';

const getHost = (path: string) => path.split('/')[1];

/**
 * AirliftService
 */
export class AirliftService extends BaseService {
  private db?: Store<AirliftStoreType>; // for persistance
  private state?: AirliftStoreType; // for state management

  handlers = {
    'realm.spaces.expand-arm': this.expandArm,
  };

  static preload = {
    expandArm: (desk: string, agent: string, arm: string) => {
      return ipcRenderer.invoke('realm.airlift.expand-arm', desk, agent, arm);
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

  /*get modelSnapshots() {
    return {
      membership: getSnapshot(this.models.membership),
      bazaar: getSnapshot(this.models.bazaar),
      visas: getSnapshot(this.models.visas),
    };
  }*/

  async load(patp: string, docket: any) {
    this.db = new AirliftStore({
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
  // ************************ AIRLIFT ***************************
  // ***********************************************************
  async expandArm(_event: any, desk: string, agent: string, arm: string) {
    this.state!.model.desks.get(desk)!.agents.get(agent)!.arms.get(arm)!.expand();
  }
}
