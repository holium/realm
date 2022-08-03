import { Instance, types } from 'mobx-state-tree';
import { LoaderModel } from '../../common.model';

export const AppModel = types.model('AppModel', {
  name: types.string,
  status: types.string,
});

export type AppModelType = Instance<typeof AppModel>;

export const BazaarStore = types
  .model('BazaarStore', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    apps: types.map(AppModel),
  })
  .views((self) => ({
    get isLoading() {
      return self.loader.state === 'loading';
    },
    get isLoaded() {
      return self.loader.state === 'loaded';
    },
    get appsList() {
      return Array.from(self.apps.values()).filter((app: AppModelType) => true);
    },
  }))
  .actions((self) => ({
    setLoader(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.loader.state = status;
    },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
