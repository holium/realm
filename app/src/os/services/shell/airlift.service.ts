import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import { getSnapshot } from 'mobx-state-tree';
import { Realm } from '../../';

import { BaseService } from '../base.service';
import { DiskStore } from '../base.store';
import { AirliftStore, AirliftStoreType } from './airlift.model';

/**
 * AirliftService
 */
export class AirliftService extends BaseService {
  private db?: DiskStore; // for persistance
  private state?: AirliftStoreType; // for state management

  handlers = {
    'realm.airlift.expand-arm': this.expandArm,
    'realm.airlift.drop-airlift': this.dropAirlift,
    'realm.airlift.remove-airlift': this.removeAirlift,
  };

  static preload = {
    dropAirlift: (spacePath: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.drop-airlift',
        spacePath,
        airliftId
      );
    },
    removeAirlift: (spacePath: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.drop-airlift',
        spacePath,
        airliftId
      );
    },
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

  async load(patp: string) {
    const secretKey: string | null = this.core.passwords.getPassword(patp);
    /*const arm = AirliftArm.create({
      name: 'hello',
      body: 'hello',
      expanded: false,
      view: 'options',
    });*/
    /*const model = AirliftModel.create({
      desks: {},
    });*/
    this.db = new DiskStore('airlift', patp, secretKey!, AirliftStore, {
      model: {},
    });
    this.state = this.db.model as AirliftStoreType;
    this.db.initialUpdate(this.core.onEffect);
    this.db.registerPatches(this.core.onEffect);
    /*this.db = AirliftStore.create({
      /*model: AirliftModel.create({
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
      },
      model: {},
      airlifts: {},
    });*/
  }

  // ***********************************************************
  // ************************ AIRLIFT ***************************
  // ***********************************************************
  async expandArm(_event: any, desk: string, agent: string, arm: string) {
    /* this.state!.model.desks.get(desk)!
      .agents.get(agent)!
      .arms.get(arm)!
      .expand();*/
  }

  async dropAirlift(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    this.state!.dropAirlift(space, airliftId, { x: 3, y: 3 });
  }

  async removeAirlift(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    this.state!.removeAirlift(space, airliftId);
  }
}
