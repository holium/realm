import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import { CourierStore, CourierStoreType } from '../models/courier';
import Store from 'electron-store';

export const loadCourierFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<CourierStoreType>({
    name: `courier`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: CourierStoreType = persisted.store;
  const isEmpty = Object.keys(persistedState).length === 0;
  const model = CourierStore.create(
    !isEmpty ? castToSnapshot(persistedState) : {}
  );

  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

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
