import { types, Instance, applySnapshot } from 'mobx-state-tree';

export const AppTypes = types.enumeration(['urbit', 'web', 'native']);

export const Glob = types.model('Glob', {
  site: types.maybe(types.string),
  glob: types.maybe(
    types.model({
      base: types.string,
      'glob-reference': types.model({
        location: types.model({
          http: types.maybe(types.string),
          ames: types.maybe(types.string),
        }),
        hash: types.string,
      }),
    })
  ),
});

export const DocketApp = types.model('DocketApp', {
  // id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.optional(AppTypes, 'urbit'),
  image: types.maybeNull(types.string),
  href: Glob,
  version: types.string,
  website: types.string,
  license: types.string,
});

type DocketAppType = Instance<typeof DocketApp>;

export const WebApp = types.model('WebApp', {
  id: types.identifier,
  title: types.string,
  color: types.string,
  info: types.maybe(types.string),
  type: types.optional(types.string, 'web'),
  icon: types.maybeNull(types.string),
  href: types.string,
});

const AppModel = types.union({ eager: false }, DocketApp, WebApp);

export const DocketStore = types
  .model('DocketStore', {
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
      Object.values(appMap)
        .filter(
          (app: DocketAppType) => app.title !== 'System' // && app.title !== 'Terminal'
        )
        .forEach((app: DocketAppType) => {
          let id = app.title;
          if (app.href.glob) {
            id = app.href.glob.base!;
          }
          const appTile = DocketApp.create({
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
          preparedApps[id] = appTile;
        });
      applySnapshot(self.apps, preparedApps);
    },
  }));
export type DocketStoreType = Instance<typeof DocketStore>;

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
