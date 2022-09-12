import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import Store from 'electron-store';
import EncryptedStore from '../encryptedStore';
import {
  NotificationStore,
  NotificationStoreType,
} from '../models/notifications';

export const loadNotificationsFromDisk = (
  patp: string,
  secretKey: string,
  onEffect: (patch: any) => void
) => {
  const baseParams = { name: 'notifications', cwd: `realm.${patp}` };
  const persisted =
    process.env.NODE_ENV === 'development'
      ? new Store<NotificationStoreType>(baseParams)
      : new EncryptedStore<NotificationStoreType>({
          secretKey,
          ...baseParams,
        });

  let persistedState: NotificationStoreType = persisted.store;
  const isEmpty = !persistedState || Object.keys(persistedState).length === 0;
  const model = NotificationStore.create(
    !isEmpty
      ? castToSnapshot(persistedState)
      : { unseen: [], seen: [], all: [], recent: [] }
  );
  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'notification',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
