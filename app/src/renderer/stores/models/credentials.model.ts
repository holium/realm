import { SnapshotOut, types } from 'mobx-state-tree';

export const CredentialsModel = types.model({
  url: types.optional(types.string, ''),
  patp: types.optional(types.string, ''),
  cookie: types.maybeNull(types.string),
  code: types.optional(types.string, ''),
});

export type MobXCredentials = SnapshotOut<typeof CredentialsModel>;
