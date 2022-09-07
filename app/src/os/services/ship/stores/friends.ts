import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import Store from 'electron-store';
import { FriendsStore, FriendsType } from './../models/friends';
import EncryptedStore from '../encryptedStore';

export const loadFriendsFromDisk = (
  patp: string,
  secretKey: string,
  onEffect: (patch: any) => void
) => {
  const baseParams = { name: 'friends', cwd: `realm.${patp}` };
  const persisted =
    process.env.NODE_ENV === 'development'
      ? new Store<FriendsType>(baseParams)
      : new EncryptedStore<FriendsType>({
          secretKey,
          ...baseParams,
        });

  let persistedState: FriendsType = persisted.store;
  const isEmpty = !persistedState || Object.keys(persistedState).length === 0;
  const model = FriendsStore.create(
    !isEmpty ? castToSnapshot(persistedState) : { all: {} }
  );
  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'friends',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
