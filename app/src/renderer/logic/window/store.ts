import { types } from 'mobx-state-tree';

const Grid = types.model({
  width: types.enumeration(['1', '2', '3']),
  height: types.enumeration(['1', '2']),
});

const Window = types.model({
  title: types.optional(types.string, ''),
  zIndex: types.number,
  grid: Grid,
});

export const WindowManager = types.model({
  window: types.maybe(Window),
});
