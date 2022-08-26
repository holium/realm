import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import { ContactStore, ContactStoreType } from '../models/contacts';
import Store from 'electron-store';

export const loadContactsFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<ContactStoreType>({
    name: `contacts`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: ContactStoreType = persisted.store;
  const isEmpty = Object.keys(persistedState).length === 0;
  const model = ContactStore.create(
    !isEmpty ? castToSnapshot(persistedState) : { ourPatp: patp }
  );
  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'contacts',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
