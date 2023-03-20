import { IKeyValueMap } from 'mobx';
import { Instance, types, applySnapshot } from 'mobx-state-tree';

const Bounds = types.model('Bounds', {
  x: types.number,
  y: types.number,
  height: types.number,
  width: types.number,
});

const Window = types
  .model('Window', {
    id: types.identifier,
    owner: types.string,
    app: types.string,
    path: types.string,
    access: types.enumeration(['write', 'read']),
    type: types.enumeration(['urbit', 'web', 'native']),
    metadata: types.map(types.string),
    zIndex: types.number,
    bounds: Bounds,
  })
  .actions((self) => ({
    setBounds(bounds: any) {
      self.bounds = bounds;
    },
    setZIndex(zIndex: number) {
      self.zIndex = zIndex;
    },
  }));

const Stack = types
  .model('Stack', {
    id: types.identifier,
    host: types.string,
    type: types.enumeration(['singleplayer', 'multiplayer']),
    windows: types.array(Window),
    metadata: types.map(types.string),
  })
  .actions((self) => ({
    addWindow(window: any) {
      self.windows.push(window);
    },
    removeWindow(windowId: string) {
      applySnapshot(
        self.windows as unknown as IKeyValueMap<string>,
        self.windows.filter((w) => w.id !== windowId)
      );
    },
    decrementLayers() {
      self.windows.forEach((window) => {
        window.setZIndex(window.zIndex - 1);
      });
    },
  }));

const Composition = types
  .model('Composition', {
    id: types.identifier,
    space: types.string,
    current: types.string,
    our: Stack,
    stacks: types.map(Stack),
  })
  .actions((self) => ({
    addStack(stack: any) {
      self.stacks.set(stack.id, stack);
    },
    removeStack(stackId: string) {
      self.stacks.delete(stackId);
    },
    setCurrentStack(stackId: string) {
      self.current = stackId;
    },
  }));

export const ComposerStore = types
  .model('ComposerStore', {
    compositions: types.map(Composition),
  })
  .actions((self) => ({
    add(space: string) {
      self.compositions.set(space, {
        id: space,
        space,
        current: '',
        our: {
          id: 'our',
          host: '',
          type: 'singleplayer',
          windows: [],
          metadata: {},
        },
        stacks: {},
      });
    },
    remove(space: string) {
      self.compositions.delete(space);
    },
  }));

export type ComposerStoreType = Instance<typeof ComposerStore>;
