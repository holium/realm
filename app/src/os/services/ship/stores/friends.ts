import { FriendsStore, FriendsType } from './../models/friends';
import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import Store from 'electron-store';

export const loadFriendsFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<FriendsType>({
    name: `friends`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: FriendsType = persisted.store;
  const isEmpty = Object.keys(persistedState).length === 0;
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
