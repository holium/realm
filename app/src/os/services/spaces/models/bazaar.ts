import { types, Instance } from 'mobx-state-tree';
import { cleanNounColor } from '../../../lib/color';
// import { NativeAppList, nativeApps } from '../../../../renderer/apps';
import { DocketApp, WebApp, Glob } from '../../ship/models/docket';
import { toJS } from 'mobx';
import { apiOwnKeys } from 'mobx/dist/internal';
import { hiDPI } from 'polished';
// const util = require('util');

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

enum AppTypes {
  Urbit = 'urbit',
  Native = 'native',
  Web = 'web',
}

const AppSlotModel = types.model({
  pinned: types.number,
  suite: types.number,
});

const UrbitApp = types.model({
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.literal(AppTypes.Urbit),
  image: types.maybeNull(types.string),
  href: Glob,
  version: types.string,
  website: types.string,
  license: types.string,
  installed: types.boolean,
  // recommended: types.optional(types.number, 0),
});
export type UrbitAppType = Instance<typeof UrbitApp>;

const NativeApp = types.model({
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.literal(AppTypes.Native),
  icon: types.maybeNull(types.string),
  // recommended: types.optional(types.number, 0),
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
    /* observable changes */
    pinnedChange: types.optional(types.boolean, false),
    suiteChange: types.optional(types.boolean, false),
    recommendedChange: types.optional(types.boolean, false),
    /* */
    recentApps: types.array(types.string),
    recentDevs: types.array(types.string),
    pinned: types.array(types.string),
    recommended: types.array(types.string),
    suite: types.array(types.string),
    apps: types.map(
      types.model({
        id: types.identifier,
        slots: AppSlotModel,
        recommendations: types.optional(types.number, 0),
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
      // return self.recommended.map((appId, index) => self.apps.get(appId));
      // return self.apps.values().
      return Array.from(self.apps.values())
        .filter((app) => app.recommendations > 0)
        .sort((a, b) => a.recommendations - b.recommendations);
      // .map((app, index) => self);
    },
  }))
  .actions((self) => ({
    setApp(app: any) {
      self.apps.set(app.id, {
        id: app.id,
        tags: app.tags,
        slots: app.slots!,
        recommendations: app.recommendations,
      });
    },
    updateSuiteRank(app: AppType) {
      if (!self.apps.has(app.id)) return;
      let suite = self.apps.get(app.id)!;
      suite.slots.suite = app.slots!.suite;
      self.apps.set(app.id, suite);
    },
    updateRecommendedRank(app: AppType) {
      if (!self.apps.has(app.id)) return;
      let rec = self.apps.get(app.id)!;
      rec.slots.recommended = app.slots!.recommended;
      self.apps.set(app.id, rec);
    },
    updatePinnedRank(app: AppType) {
      if (!self.apps.has(app.id)) return;
      let pinned = self.apps.get(app.id)!;
      pinned.slots.pinned = app.slots!.pinned;
      self.apps.set(app.id, pinned);
    },
    // findApps(searchString: string) {
    //   // const matches = [];
    //   const str = searchString.toLowerCase();
    //   const apps = Array.from(self.apps!.values());
    //   return apps.filter((item) => item.title.toLowerCase().startsWith(str));
    // },
    setPinnedApps(apps: any) {
      console.log('setPinnedApps => %o', apps);
      self.pinned.replace(apps);
    },
    setSuiteApps(apps: any) {
      self.suite.replace(apps);
    },
    setRecommendedApps(apps: any) {
      console.log('updating recommended apps => %o', apps);
      self.recommended.replace(apps);
    },
    togglePinnedAppsChange() {
      self.pinnedChange = !self.pinnedChange;
    },
    toggleRecommendedAppsChange() {
      self.recommendedChange = !self.recommendedChange;
    },
    toggleSuiteAppsChange() {
      self.suiteChange = !self.suiteChange;
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

export const MyApps = types.model('MyApps', {
  recommendations: types.array(types.string),
});
export type MyAppsType = Instance<typeof MyApps>;

export const AllyModel = types.map(
  types.model({
    ship: types.identifier,
    desks: types.optional(types.array(types.string), []),
  })
);

export type AllyModelType = Instance<typeof AllyModel>;

export const BazaarStore = types
  .model({
    // all apps installed on the local ship (our)
    // ourApps: types.map(BazaarApp),
    // space => app metadata for space specific app data
    spaces: types.map(BazaarModel),
    // apps: types.map(BazaarApp),
    _treaties: types.map(
      types.model({
        id: types.identifier,
        image: types.maybeNull(types.string),
        title: types.string,
        license: types.string,
        version: types.string,
        website: types.string,
        href: types.union(
          types.model({
            glob: Glob,
          }),
          types.model({
            site: types.string,
          })
        ),
        color: types.string,
        info: types.string,
      })
    ),
    treatyAdded: types.optional(types.boolean, false),
    allies: AllyModel,
    apps: BazaarAppMap,
    appsChange: types.optional(types.boolean, false),
    my: types.optional(MyApps, { recommendations: [] }),
  })
  .views((self) => ({
    getBazaar(path: string) {
      return self.spaces.get(path);
    },
    getAllies() {
      return Array.from(self.allies.values()).map((ally, index) => toJS(ally));
    },
    getTreaties(ship: string) {
      return Array.from(self._treaties.values())
        .filter((val, index) => val.id.split('/')[0] === ship)
        .map((treaty, index) => toJS(treaty));
    },
    getTreaty(ship: string, desk: string) {
      return toJS(self._treaties.get(`${ship}/${desk}`));
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
      // console.log('getAvailableApps => %o', self.apps.values());
      return Array.from(self.apps.values());
    },
  }))
  .actions((self) => ({
    isAppInstalled(appId: string) {
      return self.apps.get(appId)?.installed;
    },
    initialCatalog(apps: any) {
      for (const desk in apps) {
        const app = apps[desk];
        this.addApp(app.id, app, false);
      }
    },
    initial(apps: any) {
      if ('my' in apps) {
        self.my.recommendations.replace(apps.my.recommendations);
      }
      if ('catalog' in apps) {
        this.initialCatalog(apps.catalog);
      }
      const spaceApps = apps['space-apps'];
      for (const spacePath in spaceApps) {
        const entry = spaceApps[spacePath];
        this.initialSpace(spacePath, entry);
      }
      // trigger UI update if someone is listening
      self.appsChange = !self.appsChange;
    },
    initialSpace(
      spacePath: string,
      entry: any,
      triggerStateChange: boolean = false
    ) {
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
        bazaar.setApp(app);
        // console.log('self.apps.set => %o', app);
        if ('type' in app) {
          self.apps.set(app.id, app);
        }
      }
      self.spaces.set(spacePath, bazaar);
      if (triggerStateChange) {
        self.appsChange = !self.appsChange;
      }
    },
    addApp(appId: string, app: any, triggerStateChange: boolean = true) {
      const appColor = app.color;
      if (app.type === 'urbit') {
        app.color = appColor && cleanNounColor(appColor);
      }
      self.apps.set(appId, app);
      // trigger UI update if someone is listening
      if (triggerStateChange) {
        self.appsChange = !self.appsChange;
      }
    },
    setUninstalled(appId: string) {
      const app = self.apps.get(appId);
      if (app?.type === 'urbit') {
        app.installed = false;
        self.apps.set(appId, app);
        self.appsChange = !self.appsChange;
      }
    },
    updateApp(app: AppType) {
      const appColor = app.color;
      if (app.type === 'urbit') {
        app.color = appColor && cleanNounColor(appColor);
      }
      self.apps.set(app.id, app);
    },
    hasAlly(ship: any) {
      return self.allies.has(ship);
    },
    addAlly(ship: string) {
      self.allies.set(ship, { ship, desks: [] });
    },
    removeAlly(ship: string) {
      self.allies.delete(ship);
    },
    addAlliance(ship: string, desks: string[]) {
      for (let i = 0; i < desks.length; i++) {
        desks[i] = desks[i].split('/')[1];
      }
      self.allies.set(ship, { ship, desks });
    },
    addTreaty(treaty: any) {
      const id = `${treaty.ship}/${treaty.desk}`;
      self._treaties.set(id, {
        ...treaty.docket,
        color: cleanNounColor(treaty.docket.color),
        id: id,
      });
      self.treatyAdded = !self.treatyAdded;
    },
    initialTreaties(treaties: any) {
      for (const id in treaties) {
        const treaty = treaties[id];
        self._treaties.set(id, {
          ...treaty,
          color: cleanNounColor(treaty.color),
          id: id,
        });
      }
    },
    initialAllies(allies: any) {
      for (const key in allies) {
        const val = allies[key];
        self.allies.set(key, { ship: key, alliance: val });
      }
    },
    addBazaar(path: string) {
      self.spaces.set(path, BazaarModel.create({}));
    },
    searchApps(term: string) {
      const str = term.toLowerCase();
      return Array.from(self.apps.values())
        .filter((app, index) => {
          return (
            app.id.startsWith(term) || app.title.toLowerCase().startsWith(str)
          );
        })
        .map((app, index) => toJS(app));
    },
    searchTreaties(ship: string, term: string) {
      const str = term.toLowerCase();
      return Array.from(self._treaties.values())
        .filter((val, index) => {
          const tokens = val.id.split('/');
          return (
            tokens[0] === ship &&
            (val.title.toLowerCase().startsWith(str) ||
              tokens[1].startsWith(term))
          );
        })
        .map((treaty, index) => toJS(treaty));
    },
    updateMyRecommendations(recommendations: string[]) {
      console.log('updateMyRecommendations => %o', recommendations);
      self.my.recommendations.replace(recommendations);
      self.appsChange = !self.appsChange;
    },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
