import { Instance, types } from 'mobx-state-tree';

// TODO delete this file?
export const DmAppState = types.model('DmAppState', {
  current: types.string,
  state: types.model({}),
});


export const SystemTrayStore = types.model('Token', {
  dms: types.enumeration(['ethereum', 'uqbar']),
  network: types.string,
  contract: types.string,
  symbol: types.string,
});
