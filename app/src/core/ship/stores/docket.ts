import { types, Instance, flow, applySnapshot } from 'mobx-state-tree';
import { string } from 'yup';

export const Glob = types.model({
  glob: types.model({
    base: types.string,
    'glob-reference': types.model({
      location: types.model({
        http: types.string,
      }),
      hash: types.string,
    }),
  }),
});

export const AppModel = types.model({
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  image: types.maybeNull(types.string),
  href: Glob,
  // href: types.maybeNull(types.string),
  // chad: types.maybeNull(types.string),
  version: types.string,
  website: types.string,
  license: types.string,
});

export type AppModelType = Instance<typeof AppModel>;

export const DocketStore = types
  .model({
    // loader: Loader
    apps: types.map(AppModel),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.apps.values())
        .sort((a: AppModelType, b: AppModelType) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        })
        .filter(
          (app: AppModelType) => app.title !== 'System' // && app.title !== 'Terminal'
        );
    },
  }))
  .actions((self) => ({
    setInitial(appMap: { [key: string]: AppModelType }) {
      const preparedApps: { [key: string]: AppModelType } = {};
      Object.values(appMap).forEach((app: AppModelType) => {
        const appTile = AppModel.create({
          id: app.href.glob.base,
          title: app.title,
          info: app.info,
          color: app.color,
          image: app.image,
          href: Glob.create(app.href),
          version: app.version,
          website: app.website,
          license: app.license,
        });
        preparedApps[app.href.glob.base] = appTile;
      });
      applySnapshot(self.apps, preparedApps);
    },
  }));
// /**
//  * Install a foreign desk
//  */
// export function kilnInstall(
//   ship: string,
//   desk: string,
//   local?: string
// ): Poke<any> {
//   return {
//     app: 'hood',
//     mark: 'kiln-install',
//     json: {
//       ship,
//       desk,
//       local: local || desk
//     }
//   };
// }
