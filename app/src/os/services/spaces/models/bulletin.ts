import { types, Instance, applySnapshot } from 'mobx-state-tree';
import { SubscriptionStatusModel } from '../../common.model';

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
    subscriptionStatus: types.optional(SubscriptionStatusModel, {
      state: 'subscribing',
    }),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.spaces.values());
    },
    get isSubscribed() {
      return self.subscriptionStatus.isSubscribed;
    },
  }))
  .actions((self) => ({
    _initial(payload: { spaces: SpaceListingType }) {
      applySnapshot(self.spaces, payload.spaces as any);
    },
    _spaceAdded(payload: SpaceListingType) {
      self.spaces.set(payload.path, payload);
    },
    _spaceRemoved(payload: { path: string }) {
      self.spaces.delete(payload.path);
    },
    setSubscriptionStatus: (
      newSubscriptionStatus: 'subscribed' | 'subscribing' | 'unsubscribed'
    ) => {
      self.subscriptionStatus.set(newSubscriptionStatus);
    },
  }));

export type BulletinStoreType = Instance<typeof BulletinStore>;
