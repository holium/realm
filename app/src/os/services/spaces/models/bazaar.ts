import { types, Instance } from 'mobx-state-tree';
import { cleanNounColor } from '../../../lib/color';
import { NativeAppList } from '../../../../renderer/apps';
import { DocketApp, WebApp } from '../../ship/models/docket';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

export const Glob = types.model({
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

const AppRankModel = types.model({
  default: types.number,
  pinned: types.number,
  recommended: types.number,
  suite: types.number,
});

const AppTypes = types.enumeration(['urbit', 'web', 'native']);

const BazaarApp = types.model({
  id: types.identifier,
  ship: types.string,
  tags: types.array(types.string),
  ranks: AppRankModel,
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
export type BazaarAppType = Instance<typeof BazaarApp>;

// .views((self) => ({
//   get apps
// }))
// .actions((self) => ({}));

export const BazaarModel = types
  .model({
    pinned: types.array(types.string),
    endorsed: DocketMap, // recommended
    installed: DocketMap, // registered
    recentsApps: types.array(types.string),
    recentsDevs: types.array(types.string),
    allies: types.array(types.string),
    apps: types.map(BazaarApp),
  })
  .views((self) => ({
    get allApps() {
      return Array.from(self.apps!.values());
    },
    get pinnedApps() {
      return this.getAppsByTag('pinned');
    },
    get recentApps() {
      const recents = self.recentsApps;
      return [...Array.from(self.apps!.values()), ...NativeAppList]
        .filter((app: any) => recents.includes(app.id))
        .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));
    },
    get recentDevs() {
      const recents = self.recentsDevs;
      return [...Array.from(self.installed!.values()), ...NativeAppList]
        .filter((app: any) => recents.includes(app.id))
        .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));
    },
    isAppPinned(appId: string) {
      return (
        this.getAppsByTag('pinned').findIndex((item) =>
          item.tags.includes('pinned')
        ) !== -1
      );
    },
    getAppData(appId: string) {
      const apps = Array.from(self.apps!.values());
      return [...apps, ...NativeAppList].find((app: any) => app.id === appId);
    },
    getAppsByTag(tag: string) {
      const apps = Array.from(self.apps!.values());
      const result = apps.filter((app: any) => app.tags.includes(tag));
      return result || [];
    },
  }))
  .actions((self) => ({
    addApp(app: BazaarAppType) {
      self.apps.set(app.id, app);
    },
    addRecentApp(appId: string) {
      // keep no more than 5 recent app entries
      if (self.recentsApps.length >= 5) {
        self.recentsApps.pop();
      }
      // move the app up to the top if it already exists in the list
      const idx = self.recentsApps.findIndex((item) => item === appId);
      if (idx !== -1) self.recentsApps.splice(idx, 1);
      // add app to front of list
      self.recentsApps.splice(0, 0, appId);
    },
    addRecentDev(shipId: string) {
      // keep no more than 5 recent app entries
      if (self.recentsDevs.length >= 5) {
        self.recentsDevs.pop();
      }
      // move the app up to the top if it already exists in the list
      const idx = self.recentsDevs.findIndex((item) => item === shipId);
      if (idx !== -1) self.recentsDevs.splice(idx, 1);
      // add app to front of list
      self.recentsDevs.splice(0, 0, shipId);
    },
    addAppTag(appId: string, tag: string) {
      let app = self.apps.get(appId);
      if (app) {
        if (app.tags.includes(tag)) return;
        app.tags.push(tag);
        self.apps.set(appId, app);
      }
    },
    removeAppTag(appId: string, tag: string) {
      let app = self.apps.get(appId);
      if (app) {
        let idx = app.tags.findIndex((item) => item === tag);
        if (idx === -1) return;
        app.tags.splice(idx, 1);
        self.apps.set(appId, app);
      }
    },
    addToSuite(appId: string, rank: number) {
      console.log('addToSuite...');
      this.addAppTag(appId, 'suite');
      this.setAppRank(appId, 'suite', rank);
    },
    setAppRank(appId: string, tag: string, rank: number) {},
    setAllies(items: string[]) {
      self.allies.splice(0, 0, ...items);
    },
  }));
export type BazaarModelType = Instance<typeof BazaarModel>;

export const BazaarStore = types
  .model({
    // all apps installed on the local ship (our)
    // ourApps: types.map(BazaarApp),
    // space => app metadata for space specific app data
    spaces: types.map(BazaarModel),
  })
  .views((self) => ({
    getBazaar(path: string) {
      return self.spaces.get(path);
    },
  }))
  .actions((self) => ({
    initial(apps: any) {
      console.log('loading bazaar initial => %o', apps);
      // applySnapshot(self.spaces, apps['space-apps']);
      const catalog = apps['space-apps'];
      for (const spacePath in catalog) {
        const spaceApps = catalog[spacePath];
        const bazaar = BazaarModel.create({});
        for (const desk in spaceApps) {
          const app = spaceApps[desk];
          const appColor = app.color;
          app.color = appColor && cleanNounColor(appColor);
          bazaar.addApp(app);
        }
        self.spaces.set(spacePath, bazaar);
      }
    },
    addBazaar(path: string) {
      console.log('addBazaar => %o', path);
      self.spaces.set(path, BazaarModel.create({}));
    },
    our(ourPath: string, shipApps: any) {
      console.log('our => %o', { ourPath, shipApps });
      const ourBazaar = BazaarModel.create({
        pinned: [],
        installed: shipApps,
      });
      self.spaces.set(ourPath, ourBazaar);
    },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
