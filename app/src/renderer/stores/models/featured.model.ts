import { types, Instance, applySnapshot, flow } from 'mobx-state-tree';
import { SpacesIPC } from '../ipc';

export const SpaceListingModel = types.model('SpaceListingModel', {
  path: types.string,
  name: types.string,
  description: types.string,
  picture: types.string,
  color: types.string,
  loading: types.optional(types.boolean, false),
});

export const FeaturedStore = types
  .model('FeaturedStore', {
    spaces: types.map(SpaceListingModel),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.spaces.values());
    },
  }))
  .actions((self) => ({
    fetchFeatured: flow(function* () {
      const data = yield SpacesIPC.getFeaturedSpaces() as Promise<any>;
      applySnapshot(self.spaces, data);
      return data;
    }),
    _initial(payload: { spaces: SpaceListingType }) {
      applySnapshot(self.spaces, payload.spaces as any);
    },
    _spaceAdded(payload: SpaceListingType) {
      self.spaces.set(payload.path, payload);
    },
    _spaceRemoved(payload: { path: string }) {
      self.spaces.delete(payload.path);
    },
    reset() {
      applySnapshot(self, {});
    },
  }));

export type SpaceListingType = Instance<typeof SpaceListingModel>;
export type FeaturedStoreType = Instance<typeof FeaturedStore>;
