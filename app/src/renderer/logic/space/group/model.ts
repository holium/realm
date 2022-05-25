import { types, Instance, flow } from 'mobx-state-tree';

export const GroupMetadataModel = types.model({
  color: types.string,
  description: types.maybeNull(types.string),
  picture: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
});

export type GroupModelType = Instance<typeof GroupMetadataModel>;
