import {
  Instance,
  types,
  cast,
  castToReferenceSnapshot,
  tryReference,
  applySnapshot,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { Patp } from 'os/urbit/types';
import { SelectedLine } from 'renderer/system/auth/login/ShipSelector';
import { RoomsApi } from '../../api/rooms';

export const DmAppState = types.model('DmAppState', {
  current: types.string,
  state: types.model({}),
});

export const RoomInvite = types.model('RoomInvite', {
  id: types.string,
  provider: types.string,
  invitedBy: types.string,
  path: types.maybe(types.string),
});
export type RoomInviteType = Instance<typeof RoomInvite>;

export const RoomsModel = types
  .model('RoomsModel', {
    id: types.identifier,
    provider: types.string,
    creator: types.string,
    access: types.string,
    title: types.string,
    present: types.array(types.string),
    whitelist: types.array(types.string),
    capacity: types.integer,
    space: types.string,
    cursors: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    kickShip(patp: Patp) {
      self.present.remove(patp);
      self.whitelist.remove(patp);
    },
  }));
// extend a model in mobx state tree
// types.compose
// https://mobx-state-tree.js.org/tips/inheritance
//

//
export type RoomsModelType = Instance<typeof RoomsModel>;

export const RoomsAppState = types
  .model('RoomsAppState', {
    currentView: types.enumeration(['list', 'room', 'new-assembly']),
    liveRoom: types.safeReference(RoomsModel),
    knownRooms: types.map(RoomsModel),
    invites: types.map(RoomInvite),
    ourPatp: types.maybe(types.string),
    provider: types.maybe(types.string),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.knownRooms.values());
    },
    get invitesList() {
      return Array.from(self.invites.values());
    },
    isCreator(patp: Patp, roomId: string) {
      return self.knownRooms.get(roomId)?.creator === patp;
    },
    isRoomValid(roomId: string) {
      let room = self.knownRooms.get(roomId);
      if (!room) return false;
      return true;
    },
    isLiveRoom(roomId: string) {
      let room = self.knownRooms.get(roomId);
      if (!room) return false;
      if (!self.liveRoom) return false;
      return room.id === self.liveRoom.id;
    },
  }))
  .actions((self) => ({
    handleInvite(invite: RoomInviteType) {
      self.invites.set(invite.id, RoomInvite.create(invite));
    },
    acceptInvite(invite: RoomInviteType) {
      self.invites.delete(invite.id);
      self.currentView = 'room';
    },
    dismissInvite(id: string) {
      self.invites.delete(id);
    },
    // Page nav
    setView(view: 'list' | 'room' | 'new-assembly') {
      self.currentView = view;
    },
    // Update handlers
    // setRooms
    // setRoom
    // setInvited
    // setKicked
    // newChat
    handleRoomUpdate(room: RoomsModelType) {
      // console.log('inside handleRoomUpdate');
      // set room view if we just created this room
      let knownRoom = self.knownRooms.get(room.id);
      if (!knownRoom && room.creator === self.ourPatp) {
        this.setLiveRoom(room);
        this.setView('room');
      } else {
        this.setLiveRoom(room);
      }
    },
    setLiveRoom(room: RoomsModelType) {
      self.knownRooms.set(room.id, room);
      self.liveRoom = self.knownRooms.get(room.id);
    },
    unsetLiveRoom() {
      self.liveRoom = undefined;
      self.currentView = 'list';
    },
    unsetKnownRoom(id: string) {
      self.knownRooms.delete(id);
    },
    setProvider(provider: Patp) {
      self.provider = provider;
    },
    enterRoom() {
      self.currentView = 'room';
    },
    setKnownRooms(rooms: RoomsModelType[]) {
      // console.log('setting known rooms', rooms);
      if (!rooms) {
        console.log('no rooms?!?');
        self.knownRooms.clear();
        return;
      }
      const roomMap = rooms.reduce((rMap: any, room: any) => {
        rMap[room.id] = room;
        return rMap;
      }, {});
      applySnapshot(self.knownRooms, roomMap);
    },
    removeSelf(roomId: string, patp: string) {
      self.knownRooms.get(roomId)?.present.remove(patp);
    },
    leaveRoom() {
      if (self.liveRoom) {
        self.knownRooms.delete(self.liveRoom.id);
      }
      self.liveRoom = undefined;
      self.currentView = 'list';
    },
    kickRoom(patp: Patp, roomId: string) {
      self.knownRooms.get(roomId)?.kickShip(patp);
      if (self.liveRoom?.id === roomId && self.currentView === 'room') {
        self.currentView = 'list';
        self.liveRoom = undefined;
      }
      self.liveRoom = undefined;
      // TODO some info toast saying your were kicked / host left
    },
  }));

export type RoomsAppStateType = Instance<typeof RoomsAppState>;

export const SystemTrayStore = types.model('Token', {
  dms: types.enumeration(['ethereum', 'uqbar']),
  network: types.string,
  contract: types.string,
  symbol: types.string,
});
