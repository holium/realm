import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import { DocketStore, DocketStoreType } from '../models/docket';
import Store from 'electron-store';

export const loadDocketFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<DocketStoreType>({
    name: `docket`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: DocketStoreType = persisted.store;
  const isEmpty = Object.keys(persistedState).length === 0;
  const model = DocketStore.create(
    !isEmpty ? castToSnapshot(persistedState) : {}
  );
  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'docket',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
