import { Instance, types } from 'mobx-state-tree';

export const CampfireStore = types.model('ComposerStore', {
  campfires: types.map(types.string),
  view: types.maybe(types.string),
});

export type ComposerStoreType = Instance<typeof CampfireStore>;
