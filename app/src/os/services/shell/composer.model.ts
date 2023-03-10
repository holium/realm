import { Instance, types } from 'mobx-state-tree';

const Bounds = types.model('Bounds', {
  x: types.number,
  y: types.number,
  height: types.number,
  width: types.number,
});

const Window = types.model('Window', {
  id: types.identifier,
  owner: types.string,
  app: types.string,
  path: types.string,
  access: types.enumeration(['write', 'read']),
  type: types.enumeration(['urbit', 'web', 'native']),
  metadata: types.map(types.string),
  zIndex: types.number,
  bounds: Bounds,
});

const Stack = types.model('Stack', {
  id: types.identifier,
  host: types.string,
  type: types.enumeration(['singleplayer', 'multiplayer']),
  windows: types.array(Window),
  metadata: types.map(types.string),
});

const Composition = types.model('Composition', {
  id: types.identifier,
  space: types.string,
  current: types.string,
  our: Stack,
  stacks: types.map(Stack),
});

export const ComposerStore = types.model('ComposerStore', {
  compositions: types.map(Composition),
});

export type ComposerStoreType = Instance<typeof ComposerStore>;
