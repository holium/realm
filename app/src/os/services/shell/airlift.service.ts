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
    'realm.airlift.toggle-agent-expand': this.toggleAgentExpand,
    'realm.airlift.toggle-arm-expand': this.toggleArmExpand,
    'realm.airlift.drop-airlift': this.dropAirlift,
    'realm.airlift.remove-airlift': this.removeAirlift,
    'realm.airlift.on-nodes-change': this.onNodesChange,
    'realm.airlift.prompt-delete': this.promptDelete,
    'realm.airlift.unprompt-delete': this.unpromptDelete,
    'realm.airlift.set-agent-name': this.setAgentName,
    'realm.airlift.set-agent-created': this.setAgentCreated,
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
    dropAirlift: (space: string, airlift: any) => {
      return ipcRenderer.invoke('realm.airlift.drop-airlift', space, airlift);
    },
    removeAirlift: (space: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.remove-airlift',
        space,
        airliftId
      );
    },
    toggleAgentExpand: (space: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.toggle-agent-expand',
        space,
        airliftId
      );
    },
    toggleArmExpand: (space: string, airliftId: string, arm: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.toggle-arm-expand',
        space,
        airliftId,
        arm
      );
    },
    onNodesChange: (space: string, changes: NodeChange[]) => {
      return ipcRenderer.invoke(
        'realm.airlift.on-nodes-change',
        space,
        changes
      );
    },
    promptDelete: (space: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.prompt-delete',
        space,
        airliftId
      );
    },
    unpromptDelete: (space: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.unprompt-delete',
        space,
        airliftId
      );
    },
    setAgentName: (space: string, airliftId: string, name: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.set-agent-name',
        space,
        airliftId,
        name
      );
    },
    setAgentCreated: (space: string, airliftId: string) => {
      return ipcRenderer.invoke(
        'realm.airlift.set-agent-created',
        space,
        airliftId
      );
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

  async load(patp: string) {
    const secretKey: string | null = this.core.passwords.getPassword(patp);
    this.db = new DiskStore('airlift', patp, secretKey!, AirliftStore, {
      nodes: {},
    });
    this.state = this.db.model as AirliftStoreType;
    this.db.initialUpdate(this.core.onEffect);
    this.db.registerPatches(this.core.onEffect);
  }

  // ***********************************************************
  // ************************ AIRLIFT ***************************
  // ***********************************************************

  async toggleAgentExpand(_event: any, space: string, airliftId: string) {
    this.state!.nodes.get(space)!
      .find((node) => node.id === airliftId)!
      .data.agent!.toggleExpand();
  }

  async toggleArmExpand(
    _event: any,
    space: string,
    airliftId: string,
    arm: string
  ) {
    this.state!.nodes.get(space)!
      .find((node) => node.id === airliftId)!
      .data.agent!.arms.get(arm)!
      .toggleExpand();
  }

  async dropAirlift(
    _event: IpcMainInvokeEvent,
    space: string,
    newAirlift: any
  ) {
    this.state!.dropAirlift(space, newAirlift);
  }

  async removeAirlift(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    this.state!.removeAirlift(space, airliftId);
  }

  async onNodesChange(
    _event: IpcMainInvokeEvent,
    space: string,
    changes: NodeChange[]
  ) {
    this.state!.onNodesChange(space, changes);
  }

  async promptDelete(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    this.state!.promptDelete(space, airliftId);
  }

  async unpromptDelete(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    this.state!.unpromptDelete(space, airliftId);
  }

  async setAgentName(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string,
    name: string
  ) {
    const spaceNodes = this.state!.nodes.get(space);
    if (spaceNodes) {
      spaceNodes.find((node: any) => node.id === airliftId)!.data.setName(name);
    }
  }

  async setAgentCreated(
    _event: IpcMainInvokeEvent,
    space: string,
    airliftId: string
  ) {
    const spaceNodes = this.state!.nodes.get(space);
    if (spaceNodes) {
      spaceNodes.find((node: any) => node.id === airliftId)!.data.setCreated();
    }
  }

  /*async onEdgesChange(_event: IpcMainInvokeEvent, changes: EdgeChange[]) {
    this.state!.flowStore.onEdgesChange(changes);
  }
  async onConnect(_event: IpcMainInvokeEvent, connection: Connection) {
    this.state!.flowStore.onConnect(connection);
  }*/
}
