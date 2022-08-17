import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { RoomsApi } from '../../api/rooms';

import Realm from '../..';
import { BaseService } from '../base.service';
import {
  RoomsAppState,
  RoomsAppStateType,
  RoomsModelType,
} from './rooms.model';
import { Patp } from '@urbit/api';

export class RoomsService extends BaseService {
  private state?: RoomsAppStateType; // for state management
  handlers = {
    'realm.tray.rooms.join-room': this.joinRoom,
    'realm.tray.rooms.create-room': this.createRoom,
    'realm.tray.rooms.set-view': this.setView,
    'realm.tray.rooms.leave-room': this.leaveRoom,
    'realm.tray.rooms.delete-room': this.deleteRoom,
    'realm.tray.rooms.set-live': this.setLiveRoom,
    'realm.tray.rooms.unset-known-room': this.unsetKnownRoom,
    'realm.tray.rooms.request-rooms': this.requestAllRooms,
    'realm.tray.rooms.dismiss-invite': this.dismissInvite,
    'realm.tray.rooms.accept-invite': this.acceptInvite,
    'realm.tray.rooms.get-provider': this.getProvider,
    'realm.tray.rooms.set-provider': this.setProvider,
    'realm.tray.rooms.invite': this.invite,
  };

  static preload = {
    joinRoom: (roomId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.join-room', roomId);
    },
    createRoom: (
      roomId: string,
      access: string,
      title: string,
      enter: boolean
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.rooms.create-room',
        roomId,
        access,
        title,
        enter
      );
    },
    setView: (view: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.set-view', view);
    },
    setLiveRoom: (room: RoomsModelType) => {
      return ipcRenderer.invoke('realm.tray.rooms.set-live', room);
    },
    leaveRoom: (roomId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.leave-room', roomId);
    },
    deleteRoom: (roomId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.delete-room', roomId);
    },
    unsetKnownRoom: (roomId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.unset-known-room', roomId);
    },
    acceptInvite: (inviteId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.accept-invite', inviteId);
    },
    dismissInvite: (inviteId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.dismiss-invite', inviteId);
    },
    requestAllRooms: () => {
      return ipcRenderer.invoke('realm.tray.rooms.request-rooms');
    },
    getProvider: () => {
      return ipcRenderer.invoke('realm.tray.rooms.get-provider');
    },
    setProvider: (patp: Patp) => {
      return ipcRenderer.invoke('realm.tray.rooms.set-provider', patp);
    },
    invite: (roomId: string, patp: Patp) => {
      return ipcRenderer.invoke('realm.tray.rooms.invite', roomId, patp);
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    // this.core.conduit!.desk = 'realm';

    this.state = RoomsAppState.create({
      currentView: 'list',
      knownRooms: {},
      invites: {},
      ourPatp: `~${core.conduit!.ship}`,
    });

    const patchEffect = {
      model: getSnapshot(this.state),
      resource: 'rooms',
      response: 'initial',
    };
    this.core.onEffect(patchEffect);

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'rooms',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    RoomsApi.watchUpdates(this.core.conduit!, this.state!, () => {});
    //
    // TODO set provider to current space host?
    RoomsApi.setProvider(this.core.conduit!, '~' + this.core.conduit!.ship!);
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async joinRoom(_event: any, roomId: string) {
    let room = this.state?.knownRooms.get(roomId);
    if (!room) return;
    await RoomsApi.joinRoom(this.core.conduit!, roomId);
    // let room = this.state?.knownRooms.get(roomId);
    // this.state?.setLiveRoom(room!);
    // this.state?.setView('room');
  }
  setView(_event: any, view: 'list' | 'room' | 'new-room') {
    this.state?.setView(view);
  }
  setLiveRoom(_event: any, room: RoomsModelType) {
    this.state?.setLiveRoom(room);
  }
  setProvider(_event: any, patp: Patp) {
    RoomsApi.setProvider(this.core.conduit!, patp);
  }
  async leaveRoom(_event: any, roomId: string) {
    await RoomsApi.leaveRoom(this.core.conduit!, roomId, this.state!);
    this.state?.leaveRoom();
    // RoomsApi.requestAllRooms(this.core.conduit!);
  }
  async deleteRoom(_event: any, roomId: string) {
    await RoomsApi.deleteRoom(this.core.conduit!, roomId, this.state!);
  }
  async unsetKnownRoom(_event: any, roomId: string) {
    this.state?.unsetKnownRoom(roomId);
  }
  async dismissInvite(_event: any, inviteId: string) {
    this.state?.dismissInvite(inviteId);
  }
  async acceptInvite(_event: any, inviteId: string) {
    const invite = this.state?.invites.get(inviteId);
    if (!invite) return;

    // TODO this sequence would benefit from more metadata from the backend.
    // its difficult to verify the success of these calls
    //
    // await RoomsApi.leaveRoom(this.core.conduit!, invite.id, this.state!);
    this.state?.leaveRoom();
    //
    await RoomsApi.setProvider(this.core.conduit!, invite.provider);
    //
    await RoomsApi.joinRoom(this.core.conduit!, invite.id);
    this.state?.acceptInvite(invite);
  }
  requestAllRooms(_event: any) {
    RoomsApi.requestAllRooms(this.core.conduit!);
  }
  createRoom(
    _event: any,
    roomId: string,
    access: string,
    title: string,
    enter: boolean
  ) {
    RoomsApi.createRoom(this.core.conduit!, roomId, access, title, enter);
  }
  async getProvider(_event: any) {
    let res = await RoomsApi.getProvider(this.core.conduit!);
    this.state?.setProvider(res['rooms-view'].provider);
  }
  async invite(_event: any, roomId: string, patp: Patp) {
    RoomsApi.invite(this.core.conduit!, roomId, patp);
  }
  // this.state?.setIsMouseInWebview(mouseInWebview);
}
