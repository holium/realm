import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import { BazaarModel, BazaarModelType } from './models/bazaar';
import Store from 'electron-store';

export const loadBazaarFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<BazaarModelType>({
    name: `bazaar`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: BazaarModelType = persisted.store;
  const model = BazaarModel.create(castToSnapshot(persistedState));

  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'bazaar',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
