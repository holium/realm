import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import { getSnapshot } from 'mobx-state-tree';
import { Realm } from '../../';

import { BaseService } from '../base.service';
import { DiskStore } from '../base.store';
import { AirliftStore, AirliftStoreType } from './airlift.model';
import { NodeChange } from 'reactflow';

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
    'realm.airlift.on-nodes-change': this.onNodesChange,
    'realm.airlift.hide-airlift': this.hideAirlift,
    /*'realm.airlift.on-edges-change': this.onEdgesChange,
    'realm.airlift.on-connect': this.onConnect,*/
  };

  static preload = {
    /*dropAirlift: (
      spacePath: string,
      type: string,
      airliftId: string,
      position: any
    ) => {
      return ipcRenderer.invoke(
        'realm.airlift.drop-airlift',
        spacePath,
        type,
        airliftId,
        position
      );
    },*/
    dropAirlift: (airlift: any) => {
      return ipcRenderer.invoke('realm.airlift.drop-airlift', airlift);
    },
    removeAirlift: (spacePath: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.remove-airlift',
        spacePath,
        airliftId
      );
    },
    expandArm: (desk: string, agent: string, arm: string) => {
      return ipcRenderer.invoke('realm.airlift.expand-arm', desk, agent, arm);
    },
    onNodesChange: (changes: NodeChange[]) => {
      return ipcRenderer.invoke('realm.airlift.on-nodes-change', changes);
    },
    hideAirlift: (airliftId: string) => {
      return ipcRenderer.invoke('realm.airlift.hide-airlift', airliftId);
    },
    /*onEdgesChange: (changes: EdgeChange[]) => {
      return ipcRenderer.invoke('realm.airlift.on-edges-change', changes);
    },
    onConnect: (connection: Connection) => {
      return ipcRenderer.invoke('realm.airlift.on-connect', connection);
    },*/
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
      flowStore: {},
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

  /*async dropAirlift(
    _event: IpcMainInvokeEvent,
    space: string,
    type: string,
    airliftId: string,
    location: any
  ) {
    this.state!.dropAirlift(space, type, airliftId, location);
  }*/
  async dropAirlift(_event: IpcMainInvokeEvent, newAirlift: any) {
    this.state!.dropAirlift(newAirlift);
  }

  async removeAirlift(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    this.state!.removeAirlift(space, airliftId);
  }

  async onNodesChange(_event: IpcMainInvokeEvent, changes: NodeChange[]) {
    this.state!.flowStore.onNodesChange(changes);
  }

  async hideAirlift(_event: IpcMainInvokeEvent, airliftId: string) {
    this.state!.hideAirlift(airliftId);
  }
  /*async onEdgesChange(_event: IpcMainInvokeEvent, changes: EdgeChange[]) {
    this.state!.flowStore.onEdgesChange(changes);
  }
  async onConnect(_event: IpcMainInvokeEvent, connection: Connection) {
    this.state!.flowStore.onConnect(connection);
  }*/
}
