import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import Store from 'electron-store';
import { ContactStore, ContactStoreType } from '../models/contacts';
import EncryptedStore from '../encryptedStore';

export const loadContactsFromDisk = (
  patp: string,
  secretKey: string,
  onEffect: (patch: any) => void
) => {
  const baseParams = { name: `contacts`, cwd: `realm.${patp}` };
  const persisted =
    process.env.NODE_ENV === 'development'
      ? new Store<ContactStoreType>(baseParams)
      : new EncryptedStore<ContactStoreType>({
          secretKey,
          ...baseParams,
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
