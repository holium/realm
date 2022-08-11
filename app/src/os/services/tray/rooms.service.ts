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

export class RoomsService extends BaseService {
  private state?: RoomsAppStateType; // for state management
  handlers = {
    'realm.tray.rooms.join-room': this.joinRoom,
    'realm.tray.rooms.create-room': this.createRoom,
    'realm.tray.rooms.set-view': this.setView,
    'realm.tray.rooms.leave-room': this.leaveRoom,
    'realm.tray.rooms.delete-room': this.deleteRoom,
    'realm.tray.rooms.set-live': this.setLiveRoom,
    'realm.tray.rooms.request-rooms': this.requestAllRooms,
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
    requestAllRooms: () => {
      return ipcRenderer.invoke('realm.tray.rooms.request-rooms');
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.core.conduit!.desk = 'realm';

    this.state = RoomsAppState.create({
      currentView: 'list',
      knownRooms: {},
    });

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
    RoomsApi.setProvider(this.core.conduit!, '~' + this.core.conduit!.ship!);
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async joinRoom(_event: any, roomId: string) {
    await RoomsApi.joinRoom(this.core.conduit!, roomId);
    console.log('in joinroom');
    // let room = this.state?.knownRooms.get(roomId);
    // this.state?.setLiveRoom(room!);
    // this.state?.setView('room');
  }
  setView(_event: any, view: 'list' | 'room' | 'new-assembly') {
    console.log('in setView service');
    this.state?.setView(view);
  }
  setLiveRoom(_event: any, room: RoomsModelType) {
    this.state?.setLiveRoom(room);
  }
  async leaveRoom(_event: any, roomId: string) {
    await RoomsApi.leaveRoom(this.core.conduit!, roomId, this.state!);
    this.state?.leaveRoom(roomId);
    // RoomsApi.requestAllRooms(this.core.conduit!);
  }
  async deleteRoom(_event: any, roomId: string) {
    await RoomsApi.deleteRoom(this.core.conduit!, roomId, this.state!);
    // this.state?.leaveRoom(roomId);
    // RoomsApi.requestAllRooms(this.core.conduit!);
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
  // this.state?.setIsMouseInWebview(mouseInWebview);
}
