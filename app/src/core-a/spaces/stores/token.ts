import { types } from 'mobx-state-tree';

export const TokenModel = types.model('Token', {
  chain: types.enumeration(['ethereum', 'uqbar']),
  network: types.string,
  contract: types.string,
  symbol: types.string,
  // name: types.string,
  // icon: types.string,
});
