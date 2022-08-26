import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import { ChatStore, ChatStoreType } from '../models/dms';
import Store from 'electron-store';

export const loadDMsFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<ChatStoreType>({
    name: `dms`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: ChatStoreType = persisted.store;
  const isEmpty = Object.keys(persistedState).length === 0;
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
