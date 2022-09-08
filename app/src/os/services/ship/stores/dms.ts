import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import Store from 'electron-store';
import { ChatStore, ChatStoreType } from '../models/dms';
import EncryptedStore from '../encryptedStore';

export const loadDMsFromDisk = (
  patp: string,
  secretKey: string,
  onEffect: (patch: any) => void
) => {
  const baseParams = { name: 'dms', cwd: `realm.${patp}` };
  const persisted =
    process.env.NODE_ENV === 'development'
      ? new Store<ChatStoreType>(baseParams)
      : new EncryptedStore<ChatStoreType>({
          secretKey,
          ...baseParams,
        });

  let persistedState: ChatStoreType = persisted.store;
  const isEmpty = !persistedState || Object.keys(persistedState).length === 0;
  const model = ChatStore.create(
    !isEmpty ? castToSnapshot(persistedState) : {}
  );

  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'dms',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
