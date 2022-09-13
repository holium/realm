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
  ranks: AppRankModel,
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
  ranks: AppRankModel,
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
    pinned: types.array(types.string),
    recommended: types.array(types.string),
    suite: types.array(types.string),
    apps: BazaarAppMap,
  })
  .views((self) => ({
    get allApps() {
      return Array.from(self.apps!.values());
    },
    // todo: sort by recommended rank (liked count)
    get recommendedApps() {
      return self.recommended.map((appId, index) => ({
        ...self.apps.get(appId),
      }));
    },
    get suiteApps() {
      return self.suite.map((appId, index) => ({
        ...self.apps.get(appId),
      }));
    },
    get pinnedApps() {
      return self.pinned.map((appId, index) => ({
        ...self.apps.get(appId),
      }));
    },
    get recentAppList() {
      const recents = self.recentApps;
      return Array.from(self.apps!.values())
        .filter((app: any) => recents.includes(app.id))
        .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));
    },
    get recentDevList() {
      const recents = self.recentDevs;
      return Array.from(self.apps!.values())
        .filter((app: any) => recents.includes(app.id))
        .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));
    },
    isNativeApp(appId: string) {
      return self.apps.get(appId)?.type === 'native';
    },
    isAppPinned(appId: string) {
      return self.pinned.includes(appId);
    },
    getAppData(appId: string) {
      const app = self.apps.get(appId);
      // console.log('getAppData => %o', app);
      return app;
      // const all = [...Array.from(self.apps!.values()), ...NativeAppList];
      // const idx = all.findIndex((item) => item.id === appId);
      // return idx === -1 ? undefined : all[idx];
    },
  }))
  .actions((self) => ({
    addApp(app: AppType) {
      const appColor = app.color;
      if (app.type === 'urbit') {
        app.color = appColor && cleanNounColor(appColor);
      }
      self.apps.set(app.id, app);
    },
    updateApp(app: AppType) {
      // console.log('updating app => %o', app);
      const appColor = app.color;
      if (app.type === 'urbit') {
        app.color = appColor && cleanNounColor(appColor);
      }
      self.apps.set(app.id, app);
    },
    findApps(searchString: string) {
      // const matches = [];
      const str = searchString.toLowerCase();
      const apps = Array.from(self.apps!.values());
      return apps.filter((item) => item.title.toLowerCase().startsWith(str));
      // for (const app of self.allApps) {
      //   if (app[1].title.toLowerCase().startsWith(str)) {
      //     matches.push(app[1]);
      //   }
      // }
      // return matches;
    },
    setPinnedApps(apps: any) {
      self.pinned.replace(apps);
    },
    setSuiteApps(apps: any) {
      self.suite.replace(apps);
    },
    setRecommendedApps(apps: any) {
      self.recommended.replace(apps);
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
        image: types.string,
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
  })
  .views((self) => ({
    getBazaar(path: string) {
      return self.spaces.get(path);
    },
    get treaties() {
      return self._treaties;
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
          // console.log(util.inspect(app, { depth: 10 }));
          bazaar.addApp(app);
        }
        self.spaces.set(spacePath, bazaar);
      }
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
