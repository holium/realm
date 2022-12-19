// @ts-nocheck
import { types, Instance, applySnapshot } from 'mobx-state-tree';

export const SpaceListingModel = types.model('SpaceListingModel', {
  path: types.string,
  name: types.string,
  description: types.string,
  picture: types.string,
  color: types.string,
  loading: types.optional(types.boolean, false),
});

export type SpaceListingType = Instance<typeof SpaceListingModel>;

export const BulletinStore = types
  .model('BulletinStore', {
    spaces: types.map(SpaceListingModel),
    // apps: types.map(AppBulletinModel),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.spaces.values());
    },
  }))
  .actions((self) => ({
    _initial(payload: { spaces: SpaceListingType }) {
      applySnapshot(self.spaces, payload.spaces);
    },
    _spaceAdded(payload: SpaceListingType) {
      self.spaces.set(payload.path, payload);
    },
    _spaceRemoved(payload: { path: string }) {
      self.spaces.delete(payload.path);
    },
  }));

export type BulletinStoreType = Instance<typeof BulletinStore>;
