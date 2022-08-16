import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
import { MembershipStore, MembershipType } from './models/members';
import Store from 'electron-store';

export const loadMembersFromDisk = (
  patp: string,
  onEffect: (patch: any) => void
) => {
  const persisted = new Store<MembershipType>({
    name: `passports`,
    cwd: `realm.${patp}`, // base folder
  });
  let persistedState: MembershipType = persisted.store;
  const model = MembershipStore.create(castToSnapshot(persistedState));

  onSnapshot(model, (snapshot) => {
    persisted.store = castToSnapshot(snapshot);
  });

  // Start patching after we've initialized the state
  onPatch(model, (patch) => {
    const patchEffect = {
      patch,
      resource: 'membership',
      response: 'patch',
    };
    onEffect(patchEffect);
  });

  return model;
};
