import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import Store from 'electron-store';
import { DocketStore, DocketStoreType } from '../models/docket';
import EncryptedStore from '../encryptedStore';

export const loadDocketFromDisk = (
  patp: string,
  secretKey: string,

  onEffect: (patch: any) => void
) => {
  const baseParams = { name: 'docket', cwd: `realm.${patp}` };
  const persisted =
    process.env.NODE_ENV === 'development'
      ? new Store<DocketStoreType>(baseParams)
      : new EncryptedStore<DocketStoreType>({
          secretKey,
          ...baseParams,
        });

  let persistedState: DocketStoreType = persisted.store;
  const isEmpty = !persistedState || Object.keys(persistedState).length === 0;
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
