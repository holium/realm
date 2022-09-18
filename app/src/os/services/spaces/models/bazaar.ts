import { types, Instance } from 'mobx-state-tree';
import { cleanNounColor } from '../../../lib/color';
// import { NativeAppList, nativeApps } from '../../../../renderer/apps';
import { DocketApp, WebApp, Glob } from '../../ship/models/docket';
import { toJS } from 'mobx';
// const util = require('util');

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

enum AppTypes {
  Urbit = 'urbit',
  Native = 'native',
  Web = 'web',
}

const AppRankModel = types.model({
  pinned: types.number,
  recommended: types.number,
  suite: types.number,
});

const UrbitApp = types.model({
  id: types.identifier,
  // ship: types.string,
  tags: types.array(types.string),
  ranks: types.maybe(AppRankModel),
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.literal(AppTypes.Urbit),
  image: types.maybeNull(types.string),
  href: Glob,
  version: types.string,
  website: types.string,
  license: types.string,
});
export type UrbitAppType = Instance<typeof UrbitApp>;

const NativeApp = types.model({
  id: types.identifier,
  // ship: types.string,
  tags: types.array(types.string),
  ranks: types.maybe(AppRankModel),
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.literal(AppTypes.Native),
  icon: types.maybeNull(types.string),
});

export type NativeAppType = Instance<typeof NativeApp>;

const AppModel = types.union(
  {
    eager: true,
  },
  UrbitApp,
  NativeApp
);

export type AppType = Instance<typeof AppModel>;

const BazaarAppMap = types.map(
  types.union(
    {
      eager: true,
    },
    UrbitApp,
    NativeApp
  )
);

export type BazaarAppType = Instance<typeof BazaarAppMap>;

export const BazaarModel = types
  .model('BazaarModel', {
    recentApps: types.array(types.string),
    recentDevs: types.array(types.string),
    pinnedChange: types.optional(types.boolean, false),
    pinned: types.array(types.string),
    recommendedChange: types.optional(types.boolean, false),
    recommended: types.array(types.string),
    suiteChange: types.optional(types.boolean, false),
    suite: types.array(types.string),
    apps: types.map(
      types.model({
        id: types.identifier,
        ranks: AppRankModel,
        tags: types.array(types.string),
      })
    ),
  })
  .views((self) => ({
    getPinnedApps() {
      return self.pinned.map((appId, index) => self.apps.get(appId));
    },
    getSuiteApps() {
      return self.suite.map((appId, index) => self.apps.get(appId));
    },
    getRecommendedApps() {
      return self.recommended.map((appId, index) => self.apps.get(appId));
    },
  }))
  .actions((self) => ({
    setApp(app: AppType) {
      self.apps.set(app.id, {
        id: app.id,
        tags: app.tags,
        ranks: app.ranks!,
      });
    },
    updateSuiteRank(app: AppType) {
      console.log('updating suite app => %o...', app);
      if (!self.apps.has(app.id)) return;
      let suite = self.apps.get(app.id)!;
      suite.ranks.suite = app.ranks!.suite;
      self.apps.set(app.id, suite);
      self.suiteChange = !self.suiteChange;
    },
    updateRecommendedRank(app: AppType) {
      console.log('updating recommended app => %o...', app);
      if (!self.apps.has(app.id)) return;
      let rec = self.apps.get(app.id)!;
      rec.ranks.recommended = app.ranks!.recommended;
      self.apps.set(app.id, rec);
      self.recommendedChange = !self.recommendedChange;
    },
    updatePinnedRank(app: AppType) {
      console.log('updatePinnedRank => %o', app);
      if (!self.apps.has(app.id)) return;
      let pinned = self.apps.get(app.id)!;
      pinned.ranks.pinned = app.ranks!.pinned;
      self.apps.set(app.id, pinned);
      console.log('updating pinned app => %o...', app);
      self.pinnedChange = !self.pinnedChange;
    },
    findApps(searchString: string) {
      // const matches = [];
      const str = searchString.toLowerCase();
      const apps = Array.from(self.apps!.values());
      return apps.filter((item) => item.title.toLowerCase().startsWith(str));
    },
    setPinnedApps(apps: any) {
      console.log('setPinnedApps => %o', apps);
      self.pinned.replace(apps);
      self.pinnedChange = !self.pinnedChange;
    },
    setSuiteApps(apps: any) {
      self.suite.replace(apps);
      self.suiteChange = !self.suiteChange;
    },
    setRecommendedApps(apps: any) {
      console.log('updating recommended apps => %o', apps);
      self.recommended.replace(apps);
      self.recommendedChange = !self.recommendedChange;
    },
    addRecentApp(appId: string) {
      // keep no more than 5 recent app entries
      if (self.recentApps.length >= 5) {
        self.recentApps.pop();
      }
      // move the app up to the top if it already exists in the list
      const idx = self.recentApps.findIndex((item) => item === appId);
      if (idx !== -1) self.recentApps.splice(idx, 1);
      // add app to front of list
      self.recentApps.splice(0, 0, appId);
    },
    addRecentDev(shipId: string) {
      // keep no more than 5 recent app entries
      if (self.recentDevs.length >= 5) {
        self.recentDevs.pop();
      }
      // move the app up to the top if it already exists in the list
      const idx = self.recentDevs.findIndex((item) => item === shipId);
      if (idx !== -1) self.recentDevs.splice(idx, 1);
      // add app to front of list
      self.recentDevs.splice(0, 0, shipId);
    },
  }));
export type BazaarModelType = Instance<typeof BazaarModel>;

export const BazaarStore = types
  .model({
    // all apps installed on the local ship (our)
    // ourApps: types.map(BazaarApp),
    // space => app metadata for space specific app data
    spaces: types.map(BazaarModel),
    // apps: types.map(BazaarApp),
    _treaties: types.map(
      types.model({
        key: types.identifier,
        image: types.maybeNull(types.string),
        title: types.string,
        license: types.string,
        version: types.string,
        website: types.string,
        href: types.model({
          glob: Glob,
        }),
        type: types.string,
        color: types.string,
        info: types.string,
      })
    ),
    treatyAdded: types.optional(types.boolean, false),
    allies: types.map(
      types.model({
        ship: types.identifier,
        alliance: types.array(types.string),
      })
    ),
    apps: BazaarAppMap,
    appsChange: types.optional(types.boolean, false),
  })
  .views((self) => ({
    getBazaar(path: string) {
      return self.spaces.get(path);
    },
    get treaties() {
      return self._treaties;
    },
    getRecentApps(path: string) {
      return self.spaces.get(path)?.recentApps.map((appId, index) => ({
        ...toJS(self.apps.get(appId)),
      }));
    },
    getRecentDevs(path: string) {
      return self.spaces.get(path)?.recentDevs.map((appId, index) => ({
        ...toJS(self.apps.get(appId)),
      }));
    },
    getRecommendedApps(path: string) {
      return self.spaces
        .get(path)
        ?.getRecommendedApps()
        .map((app, index) => ({
          ...toJS(self.apps.get(app.id)),
          ...toJS(app),
        }));
    },
    getPinnedApps(path: string) {
      return self.spaces
        .get(path)
        ?.getPinnedApps()
        .map((app, index) => ({
          ...toJS(self.apps.get(app.id)),
          ...toJS(app),
        }));
    },
    getSuiteApps(path: string) {
      return self.spaces
        .get(path)
        ?.getSuiteApps()
        .map((app, index) => ({
          ...toJS(self.apps.get(app.id)),
          ...toJS(app),
        }));
    },
    getApps(path: string) {
      const bazaar = self.spaces.get(path);
      return bazaar
        ? Array.from(bazaar.apps.values()).map((app, index) => ({
            ...toJS(self.apps.get(app.id)),
            ...toJS(app),
          }))
        : [];
    },
    getApp(appId: string) {
      return toJS(self.apps.get(appId));
    },
    getAvailableApps() {
      return Array.from(self.apps.values());
    },
  }))
  .actions((self) => ({
    initial(apps: any) {
      const catalog = apps['space-apps'];
      // console.log('catalog => %o', catalog);
      for (const spacePath in catalog) {
        const entry = catalog[spacePath];
        // console.log('sorts => %o', entry.sorts);
        const bazaar = BazaarModel.create({
          pinned: entry.sorts.pinned,
          recommended: entry.sorts.recommended,
          suite: entry.sorts.suite,
        });
        for (const desk in entry.apps) {
          const app = entry.apps[desk];
          const appColor = app.color;
          if (app.type === 'urbit') {
            app.color = appColor && cleanNounColor(appColor);
          }
          // console.log('%o: adding app %o...', spacePath, app);
          bazaar.setApp(app);
          self.apps.set(app.id, app);
        }
        self.spaces.set(spacePath, bazaar);
      }
    },
    addApp(appId: string, app: any) {
      self.apps.set(appId, app);
      // trigger UI update if someone is listening
      self.appsChange = !self.appsChange;
    },
    updateApp(app: AppType) {
      // console.log('updating app => %o', app);
      const appColor = app.color;
      if (app.type === 'urbit') {
        app.color = appColor && cleanNounColor(appColor);
      }
      self.apps.set(app.id, app);
    },
    hasAlly(ship: any) {
      // console.log('hasAlly => %o', toJS(self.allies));
      return self.allies.has(ship);
    },
    addAlly(ally: any) {
      self.allies.set(ally.alliance[0], ally.ship);
    },
    addTreaty(treaty: any) {
      // self.treaties.push(`${treaty.ship}/${treaty.desk}`);
      const key = `${treaty.ship}/${treaty.desk}`;
      // console.log('adding treaty => %o', { k: key, treaty });
      self._treaties.set(key, {
        ...treaty.docket,
        key: key,
      });
      self.treatyAdded = !self.treatyAdded;
    },
    initialTreaties(treaties: any) {
      // console.log('initial treaties => %o', treaties);
      for (const key in treaties) {
        const val = treaties[key];
        self._treaties.set(key, {
          ...val,
          key: key,
        });
      }
    },
    initialAllies(allies: any) {
      // console.log(toJS(allies));
      for (const key in allies) {
        const val = allies[key];
        // console.log('adding ally => %o', val);
        self.allies.set(key, { ship: key, alliance: val });
      }
    },
    addBazaar(path: string) {
      // console.log('addBazaar => %o', path);
      self.spaces.set(path, BazaarModel.create({}));
    },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
