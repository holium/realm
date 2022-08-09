import { Instance, types } from 'mobx-state-tree';

export const DmAppState = types.model('DmAppState', {
  current: types.string,
  state: types.model({}),
});

const RoomsModel = types.model({
  id: types.identifier,
  title: types.string,
  provider: types.string,
  host: types.string,
  people: types.array(types.string),
  cursors: types.optional(types.boolean, false),
  private: types.optional(types.boolean, false),
});

export type RoomsModelType = Instance<typeof RoomsModel>;

export const RoomsAppState = types
  .model('RoomsAppState', {
    currentView: types.enumeration(['list', 'room', 'new-assembly']),
    selected: types.safeReference(RoomsModel),
    live: types.safeReference(RoomsModel),
    rooms: types.array(RoomsModel),
  })
  .actions((self) => ({
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
    setSelected(selected: RoomsModelType) {
      const room = self.rooms.find(
        (a: RoomsModelType) => a.title === selected.title
      );
      self.selected = room;
      self.live = room;
    },
    startRoom(newRoomData: RoomsModelType) {
      const newRoom = RoomsModel.create(newRoomData);
      self.rooms.unshift(newRoom);
      self.selected = newRoom;
      self.live = newRoom;
    },
    leaveRoom(ourShip: string) {
      if (ourShip === self.selected?.host) {
        self.rooms.remove(self.selected!);
      }
      self.selected = undefined;
      self.live = undefined;
      self.currentView = 'list';
    },
    testAction() {
      console.log("banana")
    }
  }));

export type RoomsAppStateType = Instance<typeof RoomsAppState>;

export const SystemTrayStore = types.model('Token', {
  dms: types.enumeration(['ethereum', 'uqbar']),
  network: types.string,
  contract: types.string,
  symbol: types.string,
});