import { Instance, types } from 'mobx-state-tree';
import { Theme } from './theme.model';

export const AccountModel = types.model('AccountModel', {
  onboardingId: types.maybeNull(types.string),
  url: types.string,
  patp: types.identifier,
  type: types.enumeration(['hosted', 'local']),
  nickname: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  theme: Theme,
  status: types.maybeNull(types.string),
  createdAt: types.number,
  updatedAt: types.number,
});

export type AccountModelType = Instance<typeof AccountModel>;
