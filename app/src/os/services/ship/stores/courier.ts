import {
  castToSnapshot,
  getSnapshot,
  onPatch,
  onSnapshot,
} from 'mobx-state-tree';
import Store from 'electron-store';
import { CourierStore, CourierStoreType } from '../models/courier';
import EncryptedStore from '../encryptedStore';

export const loadCourierFromDisk = (
  patp: string,
  secretKey: string,
  onEffect: (patch: any) => void
) => {
  const baseParams = { name: 'courier', cwd: `realm.${patp}` };
  const persisted =
    process.env.NODE_ENV === 'development'
      ? new Store<CourierStoreType>(baseParams)
      : new EncryptedStore<CourierStoreType>({
          secretKey,
          ...baseParams,
        });

  let persistedState: CourierStoreType = persisted.store;
  const isEmpty = !persistedState || Object.keys(persistedState).length === 0;
  const model = CourierStore.create(
    !isEmpty ? castToSnapshot(persistedState) : {}
  );

  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Send initial
  const patchEffect = {
    model: getSnapshot(model),
    resource: 'courier',
    response: 'initial',
  };
  onEffect(patchEffect);

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'courier',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
