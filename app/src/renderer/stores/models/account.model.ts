import { Instance, types } from 'mobx-state-tree';

import { Theme } from './theme.model';

export const AccountModel = types.model('AccountModel', {
  accountId: types.maybe(types.number),
  type: types.enumeration(['local', 'hosted']),
  patp: types.identifier,
  url: types.string,
  nickname: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  status: types.maybeNull(types.string),
  theme: Theme,
  createdAt: types.number,
  updatedAt: types.number,
});

export type AccountModelType = Instance<typeof AccountModel>;
