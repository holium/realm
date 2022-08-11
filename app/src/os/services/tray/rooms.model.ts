import {
  Instance,
  types,
  cast,
  castToReferenceSnapshot,
  tryReference,
  applySnapshot,
} from 'mobx-state-tree';
import { Patp } from 'os/urbit/types';
import { SelectedLine } from 'renderer/system/auth/login/ShipSelector';
import { RoomsApi } from '../../api/rooms';

export const DmAppState = types.model('DmAppState', {
  current: types.string,
  state: types.model({}),
});

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
      console.log('kicking ship from room', patp);
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
  })
  .views((self) => ({
    get list() {
      return Array.from(self.knownRooms.values());
    },
    isCreator(patp: Patp, roomId: string) {
      return self.knownRooms.get(roomId)?.creator === patp;
    },
  }))
  .actions((self) => ({
    // Page nav
    setView(view: 'list' | 'room' | 'new-assembly') {
      console.log('setting view bitch', view);
      self.currentView = view;
    },
    // Update handlers
    // setRooms
    // setRoom
    // setInvited
    // setKicked
    // newChat
    setLiveRoom(room: RoomsModelType) {
      console.log('inside setLiveRoom');
      // console.log(room);
      // self.knownRooms.unshift(room)
      // self.knownRooms.unshift(room);
      // applySnapshot(self.knownRooms.)
      self.knownRooms.set(room.id, room);
      self.liveRoom = self.knownRooms.get(room.id);
      // self.currentView = 'room';
    },
    unsetLiveRoom() {
      self.liveRoom = undefined;
      self.currentView = 'list';
      // self.currentView = 'room';
    },
    enterRoom() {
      // self.liveRoom = undefined;
      self.currentView = 'room';
      // self.currentView = 'room';
    },
    setKnownRooms(rooms: RoomsModelType[]) {
      // try cast, castToSnapshot (makes json version of the model)
      const roomMap = rooms.reduce((rMap: any, room: any) => {
        rMap[room.id] = room;
        return rMap;
      }, {});

      console.log('known', roomMap);

      applySnapshot(self.knownRooms, roomMap);
      // self.knownRooms.clear();
      // rooms.forEach((room: RoomsModelType) => {
      //   self.knownRooms.set(room.id, room);
      // });
    },
    removeSelf(roomId: string, patp: string) {
      self.knownRooms.get(roomId)?.present.remove(patp);
    },
    setSelected(selected: RoomsModelType) {
      // const room = self.knownRooms.find(
      //   (a: RoomsModelType) => a!.title === selected!.title
      // );
      const selectedRoom = self.knownRooms.get(selected.id);
      if (!selectedRoom) return;
      self.liveRoom = selectedRoom;
      self.currentView = 'room';
    },
    // startRoom(newRoomData: RoomsModelType) {
    //   const newRoom = RoomsModel.create(newRoomData);
    //   // self.knownRooms.unshift(newRoom);
    //   self.liveRoom = newRoom;
    // },
    leaveRoom(ourShip: string) {
      //   if (ourShip === self.selected?.host) {
      //     self.knownRooms.remove(self.selected!);
      //   }
      // TODO send %exit poke
      console.log('inside leaveRoom');
      self.liveRoom = undefined;
      // TODO better naming / notify somehow
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
