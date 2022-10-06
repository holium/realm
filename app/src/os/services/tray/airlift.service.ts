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
import { AirliftStore, AirliftStoreType, AirliftModel, AirliftArmType, AirliftArm } from './airlift.model';

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
    const arm: AirliftArmType = new AirliftArm({
        name: 'hello',
        body: 'hello',
        expanded: false,
        view: 'options',
    })
    const model = new AirliftModel({
        desks: {}
    })
    this.db = new AirliftStore({
      model: new AirliftModel({
        desks: {
          '0': {
            agents: {
                '%test': {
                  arms: {
                    name: 'TEST',
                    body: 'asdf',
                    cards: 'asdf',
                    expanded: '',
                    view: 'options'
                  }
                }
            }
          }
        }
      }
    });

    let persistedState: AirliftStoreType = this.db!.store;
    this.state = AirliftStore.create(castToSnapshot(persistedState));

    // set up snapshotting
    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

    // Start patching after we've initialized the state
    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'airlift',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });
  }

  // ***********************************************************
  // ************************ AIRLIFT ***************************
  // ***********************************************************
  async expandArm(_event: any, desk: string, agent: string, arm: string) {
    this.state!.model.desks.get(desk)!.agents.get(agent)!.arms.get(arm)!.expand();
  }
}
