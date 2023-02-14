import { types, Instance, applySnapshot } from 'mobx-state-tree';
import { SubscriptionModel } from '../../common.model';

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
    subscription: types.optional(SubscriptionModel, {
      state: 'subscribing',
    }),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.spaces.values());
    },
    get subscriptionState() {
      return self.subscription.state;
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
      self.subscription.set(newSubscriptionStatus);
    },
  }));

export type BulletinStoreType = Instance<typeof BulletinStore>;
