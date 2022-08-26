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
  state?: RoomsAppStateType; // for state management
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
    'realm.tray.rooms.set-muted': this.setMuted,
    'realm.tray.rooms.set-cursor': this.setCursors,
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
    setMuted: (muted: boolean) => {
      return ipcRenderer.invoke('realm.tray.rooms.set-muted', muted);
    },
    setCursors: (cursor: boolean) => {
      return ipcRenderer.invoke('realm.tray.rooms.set-cursor', cursor);
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
    onRoomUpdate: (callback: any) =>
      ipcRenderer.on('realm.on-room-update', callback),
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async onLogin(ship: string) {
    this.state = RoomsAppState.create({
      currentView: 'list',
      knownRooms: {},
      invites: {},
      ourPatp: ship,
      outstandingRequest: false,
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

    RoomsApi.watchUpdates(
      this.core.conduit!,
      this.state!,
      (diff: RoomDiff, room: RoomsModelType) => {
        this.core.mainWindow.webContents.send(
          'realm.on-room-update',
          diff,
          room
        );
      }
    );
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async joinRoom(_event: any, roomId: string) {
    let room = this.state?.knownRooms.get(roomId);
    if (!room) return;
    await RoomsApi.joinRoom(this.core.conduit!, roomId);
    // Start rooms
  }
  setView(_event: any, view: 'list' | 'room' | 'new-room') {
    this.state?.setView(view);
  }
  setMuted(_event: any, muted: boolean) {
    this.state?.setMuted(muted);
  }
  setCursors(_event: any, cursors: boolean) {
    this.state?.setCursors(cursors);
  }
  setLiveRoom(_event: any, room: RoomsModelType) {
    this.state?.setLiveRoom(room);
  }
  setProvider(_event: any, patp: Patp) {
    RoomsApi.setProvider(this.core.conduit!, patp);
    this.state?.setProvider(patp);
  }
  async leaveRoom(_event: any, roomId: string) {
    await RoomsApi.leaveRoom(this.core.conduit!, roomId, this.state!);
    this.state?.leaveRoom();
  }
  async deleteRoom(_event: any, roomId: string) {
    RoomsApi.deleteRoom(this.core.conduit!, roomId, this.state!);
    this.state!.deleteRoom(roomId);
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
    this.state?.leaveRoom();
    //
    await RoomsApi.setProvider(this.core.conduit!, invite.provider);
    //
    await RoomsApi.joinRoom(this.core.conduit!, invite.id);
    this.state?.acceptInvite(invite);
  }
  async requestAllRooms(_event: any) {
    await RoomsApi.requestAllRooms(this.core.conduit!);
    this.state?.didRequest();
  }
  async createRoom(
    _event: any,
    roomId: string,
    access: string,
    title: string,
    enter: boolean
  ) {
    return RoomsApi.createRoom(
      this.core.conduit!,
      roomId,
      access,
      title,
      enter
    );
  }
  async getProvider(_event: any) {
    let res = await RoomsApi.getProvider(this.core.conduit!);
    return res['rooms-view'];
  }
  async invite(_event: any, roomId: string, patp: Patp) {
    RoomsApi.invite(this.core.conduit!, roomId, patp);
  }

  onLogout() {
    this.state = undefined;
  }
  // this.state?.setIsMouseInWebview(mouseInWebview);
}

export type RoomDiff = { enter: Patp } | { exit: Patp };
