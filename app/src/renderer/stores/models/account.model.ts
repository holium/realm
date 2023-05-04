import { SnapshotOut, types } from 'mobx-state-tree';

import { Theme } from './theme.model';

export const AccountModel = types.model('AccountModel', {
  accountId: types.number,
  serverId: types.identifier,
  serverUrl: types.string,
  serverType: types.string,
  nickname: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  status: types.maybeNull(types.string),
  passwordHash: types.string,
  theme: Theme,
  createdAt: types.number,
  updatedAt: types.number,
});

export type MobXAccount = SnapshotOut<typeof AccountModel>;
