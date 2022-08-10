import { castToSnapshot, onSnapshot } from 'mobx-state-tree';
import { MembershipStore, MembershipType } from './models/members';
import Store from 'electron-store';

export const loadMembersFromDisk = (patp: string) => {
  const persisted = new Store<MembershipType>({
    name: `passports`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: MembershipType = persisted.store;
  const model = MembershipStore.create(castToSnapshot(persistedState));

  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  return model;
};
