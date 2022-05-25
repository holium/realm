import { types, Instance, flow, applySnapshot } from 'mobx-state-tree';

export const Glob = types.model({
  glob: types.model({
    base: types.string,
    'glob-reference': types.model({
      location: types.model({
        http: types.maybe(types.string),
        ames: types.maybe(types.string),
      }),
      hash: types.string,
    }),
  }),
});

export const DocketApp = types.model({
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.optional(types.string, 'urbit'),
  image: types.maybeNull(types.string),
  href: Glob,
  version: types.string,
  website: types.string,
  license: types.string,
});

export type DocketAppType = Instance<typeof DocketApp>;

export const WebApp = types.model({
  id: types.identifier,
  title: types.string,
  type: types.optional(types.string, 'web'),
  icon: types.maybeNull(types.string),
  href: types.string,
});

export type WebAppType = Instance<typeof WebApp>;

export const AppModel = types.union({ eager: false }, DocketApp, WebApp);

export type AppModelType = Instance<typeof AppModel>;

export const DocketStore = types
  .model({
    // loader: Loader
    apps: types.map(DocketApp),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.apps.values())
        .sort((a: DocketAppType, b: DocketAppType) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        })
        .filter(
          (app: DocketAppType) => app.title !== 'System' // && app.title !== 'Terminal'
        );
    },
  }))
  .actions((self) => ({
    setInitial(appMap: { [key: string]: DocketAppType }) {
      const preparedApps: { [key: string]: DocketAppType } = {};
      Object.values(appMap).forEach((app: DocketAppType) => {
        const appTile = DocketApp.create({
          id: app.href.glob.base,
          title: app.title,
          info: app.info,
          color: app.color,
          image: app.image,
          type: 'urbit',
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
