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
    'realm.tray.rooms.refresh-local-room': this.refreshLocalRoom,
    'realm.tray.rooms.dismiss-invite': this.dismissInvite,
    'realm.tray.rooms.accept-invite': this.acceptInvite,
    'realm.tray.rooms.get-provider': this.getProvider,
    'realm.tray.rooms.set-provider': this.setProvider,
    'realm.tray.rooms.invite': this.invite,
    'realm.tray.rooms.set-muted': this.setMuted,
    'realm.tray.rooms.set-cursor': this.setCursors,
    'realm.tray.rooms.send-chat': this.sendChat,
    'realm.tray.rooms.kick-user': this.kickUser,
    'realm.tray.rooms.exit-room': this.exitRoom,
    'realm.tray.rooms.reset-local': this.resetLocal,


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
    kickUser: (roomId: string, patp: Patp) => {
      return ipcRenderer.invoke('realm.tray.rooms.kick-user', roomId, patp);
    },
    exitRoom: () => {
      return ipcRenderer.invoke('realm.tray.rooms.exit-room');
    },
    resetLocal: () => {
      return ipcRenderer.invoke('realm.tray.rooms.reset-local');
    },
    refreshLocalRoom: () => {
      return ipcRenderer.invoke('realm.tray.rooms.refresh-local-room');
    },
    sendChat: (ourPatP: Patp, chat: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.send-chat', ourPatP, chat);
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
        console.log('12oij12j312kj,', diff, room)
        this.core.mainWindow.webContents.send(
          'realm.on-room-update',
          diff,
          room
        );
      }
    );
  }
  removeHandlers() {
    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.removeHandler(handlerName);
    });
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
    RoomsApi.leaveRoom(this.core.conduit!, roomId, this.state!);
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
  sendChat(_event: any, ourPatP: Patp, chat: string) {
    RoomsApi.sendChat(this.core.conduit!, chat);
    this.state?.appendOurChat(ourPatP, chat);
  }
  
  async requestAllRooms(_event: any) {
    //
    // track outstanding request to display loading state in List view
    this.state?.didRequest();

    await RoomsApi.requestAllRooms(this.core.conduit!);
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
    let provider = res['rooms-view']['provider']
    if(provider === null) provider = undefined;
    this.state?.setProvider(provider)
    return provider;
  }
  async invite(_event: any, roomId: string, patp: Patp) {
    return RoomsApi.invite(this.core.conduit!, roomId, patp);
  }
  async kickUser(_event: any, roomId: string, patp: Patp) {
    console.log("kicking user")
    let room = this.state?.knownRooms.get(roomId);
    if(!room) return;
    console.log("kicking user1", room.creator, this.core!.conduit!.ship)

    if(room.creator !== "~"+this.core!.conduit!.ship) return;
    console.log("kicking user2")


    if(!room.present.includes(patp)) return;
    console.log("kicking user3")


    return RoomsApi.kick(this.core.conduit!, roomId, patp);
  }

  async exitRoom(_event: any) {
    this.state?.setView('list')
    return RoomsApi.exit(this.core.conduit!);
  }
  async resetLocal(_event: any) {
    this.state?.resetLocal();
  }

  //
  // scry latest state from room client agent
  // apply it to room model state representation.
  async refreshLocalRoom(_event: any) {
      let res = await RoomsApi.getFull(this.core.conduit!);
      
      let full = res['rooms-view']['full']
      let room = full['my-room']
      if(room === null) {
        // room is null.
        // this update can come from a scry to the room client agent
        this.state?.unsetLiveRoom();
      } else {
        this.state?.setLiveRoom(room);
      }

      let provider = full['provider']
      if(provider === null) {
        this.state?.setProvider('~'+this.core?.conduit?.ship!);
      } else {
        this.state?.setProvider(full['provider']);
      }

  }

  onLogout() {
    this.state = undefined;
  }
  // this.state?.setIsMouseInWebview(mouseInWebview);
}

export type RoomDiff = { enter: Patp } | { exit: Patp };
