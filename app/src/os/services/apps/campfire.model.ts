import { Instance, types } from 'mobx-state-tree';

export const CampfireStore = types
  .model('ComposerStore', {
    campfires: types.map(types.string),
    view: types.maybe(types.string),
  })
  .actions((self) => ({
    setView(view: string) {
      self.view = view;
    },
  }));

export type CampfireStoreType = Instance<typeof CampfireStore>;
