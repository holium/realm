import { LoaderModel } from './../stores/common/loader';
import { types, Instance, flow } from 'mobx-state-tree';
import { getApps } from './app/api';

export const AppModel = types.model({
  title: types.string,
  info: types.string,
  color: types.string,
  image: types.maybeNull(types.string),
  href: types.maybeNull(types.string),
  version: types.string,
  website: types.string,
  license: types.string,
});
export type AppModelType = Instance<typeof AppModel>;

export const SpaceStore = types
  .model({
    loader: types.optional(LoaderModel, { state: 'initial' }),
    apps: types.map(AppModel),
    pinned: types.array(types.reference(AppModel)),
  })
  .views((self) => ({
    get appGrid() {
      return Array.from(self.apps.values());
    },
  }))
  .actions((self) => ({
    // TODO make scrys happen from UI only
    initialize: flow(function* () {
      // window.electron.core.;
      // const [response, error] = yield getApps((_event: any, value: any) =>
      //   console.log(value)
      // );
      // console.log('got apps');
      // if (error) throw error;
      // console.log(response);
    }),
    getApps: flow(function* () {
      self.loader.set('loading');
      self.apps.clear(); //
      const [response, error] = yield getApps();
      if (error) throw error;
      Object.values<any>(response.initial).forEach((app: AppModelType) => {
        const appTile = AppModel.create({
          title: app.title,
          info: app.info,
          color: app.color,
          image: app.image,
          version: app.version,
          website: app.website,
          license: app.license,
        });
        self.apps.set(app.title, appTile);
      });
      self.loader.set('loaded');
      // console.log(response.initial);
    }),
    // onScry: (scry: { app: string; path: string; data: any }) => {
    //   // console.log('in space store effect', scry.data);
    //   if (scry.app === 'docket') {
    //     Object.values<any>(scry.data.initial).forEach((app: AppModelType) => {
    //       const appTile = AppModel.create({
    //         title: app.title,
    //         info: app.info,
    //         color: app.color,
    //         image: app.image,
    //         version: app.version,
    //         website: app.website,
    //         license: app.license,
    //       });
    //       self.apps.set(appTile);
    //     });
    //   }
    // },
  }));

export type SpaceStoreType = Instance<typeof SpaceStore>;
