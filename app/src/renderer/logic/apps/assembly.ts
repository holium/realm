import { Instance, types } from 'mobx-state-tree';

export const DmAppState = types.model('DmAppState', {
  current: types.string,
  state: types.model({}),
});

const AssemblyModel = types.model({
  id: types.identifier,
  title: types.string,
  host: types.string,
  people: types.array(types.string),
  cursors: types.optional(types.boolean, true),
  private: types.optional(types.boolean, false),
});

export type AssemblyModelType = Instance<typeof AssemblyModel>;

export const AssemblyAppState = types
  .model('AssemblyAppState', {
    currentView: types.enumeration(['list', 'room', 'new-assembly']),
    selected: types.safeReference(AssemblyModel),
    assemblies: types.array(AssemblyModel),
  })
  .actions((self) => ({
    setView(view: 'list' | 'room' | 'new-assembly') {
      self.currentView = view;
    },
    setSelected(selected: AssemblyModelType) {
      self.selected = self.assemblies.find(
        (a: AssemblyModelType) => a.title === selected.title
      );
    },
    startRoom(newRoomData: AssemblyModelType) {
      const newRoom = AssemblyModel.create(newRoomData);
      self.assemblies.unshift(newRoom);
      self.selected = newRoom;
    },
  }));

export type AssemblyAppStateType = Instance<typeof AssemblyAppState>;

export const SystemTrayStore = types.model('Token', {
  dms: types.enumeration(['ethereum', 'uqbar']),
  network: types.string,
  contract: types.string,
  symbol: types.string,
});
