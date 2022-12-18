import {
  AddToSuitePoke,
  BazaarApi,
  InstallPoke,
  PinPoke,
  RemoveFromSuitePoke,
  UninstallPoke,
  UnpinPoke,
} from '../../../api/bazaar';

import {
  types,
  Instance,
  applySnapshot,
  getSnapshot,
  flow,
} from 'mobx-state-tree';

import { cleanNounColor } from '../../../lib/color';
import { Conduit } from '@holium/conduit';
import { Patp } from '../../../types';
import { DocketApi } from '../../../api/docket';

const setAppStatus = (app: AppType, status: InstallStatus) => {
  if (app.type !== 'urbit') return app;
  app as UrbitAppType;
  app.installStatus = status;
  return app as AppType;
};

export enum InstallStatus {
  uninstalled = 'uninstalled',
  initial = 'initial',
  started = 'started',
  failed = 'failed',
  installed = 'installed',
  treaty = 'treaty',
  suspended = 'suspended',
  resuming = 'resuming',
  // this is set when joining a space and you do not have the app
  //  installed, but want it to appear on the home screen. this
  //  is different than uninstalled which has %suspend implications
  //  on the back-end. %desktop requires a fresh install.
  desktop = 'desktop',
}

export enum AppTypes {
  Urbit = 'urbit',
  Native = 'native',
  Web = 'web',
  Dev = 'dev',
}

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

export const RealmConfig = types.model('RealmConfig', {
  size: types.array(types.number),
  showTitlebar: types.boolean,
  titlebarBorder: types.boolean,
});

export const DocketApp = types.model('DocketApp', {
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  image: types.maybeNull(types.string),
  href: Glob,
  version: types.string,
  website: types.string,
  license: types.string,
  installStatus: types.optional(types.string, InstallStatus.installed),
});

export const DevAppModel = types.model('DevApp', {
  id: types.identifier,
  title: types.string,
  type: types.literal(AppTypes.Dev),
  color: types.string,
  icon: types.string,
  installStatus: types.optional(types.string, InstallStatus.installed),
  config: types.maybeNull(RealmConfig),
  web: types.model('WebConfig', {
    url: types.string,
    openFullscreen: types.optional(types.boolean, false),
  }),
});

export const WebApp = types.model('WebApp', {
  id: types.identifier,
  title: types.string,
  href: types.string,
  favicon: types.maybeNull(types.string),
  type: types.literal(AppTypes.Web),
  config: types.maybeNull(RealmConfig),
  installStatus: types.optional(types.string, InstallStatus.installed),
});

export const UrbitApp = types.model('UrbitApp', {
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
  installStatus: types.string,
  host: types.maybeNull(types.string),
  config: types.maybeNull(RealmConfig),
});

const NativeApp = types.model('NativeApp', {
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  installStatus: types.optional(types.string, 'installed'),
  type: types.literal(AppTypes.Native),
  icon: types.maybeNull(types.string),
  config: types.maybeNull(RealmConfig),
});

const AppModel = types.union(
  {
    eager: true,
  },
  UrbitApp,
  // WebApp,
  DevAppModel,
  NativeApp
);

const AppId = types.string;
const OrderedAppList = types.array(types.string);
// const RecommendedByShips = types.array(types.string);

export const StallModel = types.model('StallModel', {
  suite: types.map(AppId), // (map index app-id)
  recommended: types.map(types.integer),
});

export const AllyModel = types.model('AllyModel', {
  ship: types.identifier,
  desks: types.optional(types.array(types.string), []),
});

export const NewBazaarStore = types
  .model('NewBazaarStore', {
    docks: types.map(OrderedAppList),
    stalls: types.map(StallModel),
    recommendations: types.array(AppId),
    catalog: types.map(AppModel),
    gridIndex: types.map(AppId),
    treaties: types.map(DocketApp),
    allies: types.map(AllyModel),
    loadingAllies: false,
    loadingTreaties: false,
    addingAlly: types.map(types.string),
    devAppMap: types.map(DevAppModel),
    treatiesLoaded: types.optional(types.boolean, false),
    recentApps: types.array(types.string),
    recentDevs: types.array(types.string),
  })
  .actions((self) => ({
    // Updates
    _setAppStatus(appId: string, app: UrbitAppType, gridIndex: any) {
      self.catalog.set(appId, {
        ...app,
        color: cleanNounColor(app.color),
      });
      applySnapshot(self.gridIndex, gridIndex);
    },
    _addPinned(data: { path: string; id: string; index: number }) {
      if (!self.docks.has(data.path)) {
        self.docks.set(data.path, []);
      }
      const dock = self.docks.get(data.path);
      dock?.push(data.id);
      self.docks.set(data.path, dock);
    },
    _removePinned(data: { path: string; id: string }) {
      const dock = self.docks.get(data.path);
      const removeIndex = dock?.findIndex((id: string) => id === data.id)!;
      dock?.splice(removeIndex, 1);
      self.docks.set(data.path, dock);
    },
    _suiteAdded(data: { path: string; id: string; index: number }) {
      const stall = self.stalls.get(data.path);
      if (!stall) return;
      stall?.suite.set(`${data.index}`, data.id);
      self.stalls.set(data.path, stall);
    },
    _suiteRemoved(data: { path: string; index: number }) {
      const stall = self.stalls.get(data.path);
      if (!stall) return;
      stall.suite.delete(`${data.index}`);
      self.stalls.set(data.path, stall);
    },
    _initial(data: any) {
      Object.keys(data.catalog).forEach((key: string) => {
        const docket = data.catalog[key];
        if (docket.type === 'urbit') {
          data.catalog[key].color = cleanNounColor(data.catalog[key].color);
        }
      });
      applySnapshot(self.docks, data.docks);
      applySnapshot(self.catalog, data.catalog);
      applySnapshot(self.recommendations, data.recommendations);
      applySnapshot(self.stalls, data.stalls);
      applySnapshot(self.gridIndex, data.grid);
    },
    _addJoined(data: { path: string; stall: any; catalog: any }) {
      Object.keys(data.catalog).forEach((key: string) => {
        const docket = data.catalog[key];
        if (docket.type === 'urbit') {
          data.catalog[key].color = cleanNounColor(data.catalog[key].color);
        }
      });
      self.catalog.merge(data.catalog);
      self.stalls.set(data.path, data.stall);
    },
    _updateStall(data: any) {
      if ('add-app' in data) {
        const app: AppType = data['add-app'];
        if (app.type === 'urbit') {
          app.color = cleanNounColor(app.color);
        }
        self.catalog.set(app.id, app);
      } else if ('remove-app' in data) {
        // const appId: string = data['remove-app'];
      }
      self.stalls.set(data.path, data.stall);
    },
    _rebuildCatalog(data: any) {
      if (data.catalog) {
        for (let i = 0; i < data.catalog.length; i++) {
          const app: AppType = data.catalog[i];
          if (app.type === 'urbit') {
            app.color = cleanNounColor(app.color);
          }
          self.catalog.set(app.id, app);
        }
        self.gridIndex.clear();
        self.gridIndex.merge(data.grid);
      }
    },
    _rebuildStall(data: any) {
      if (data.catalog) {
        for (let i = 0; i < data.catalog.length; i++) {
          const app: AppType = data.catalog[i];
          if (app.type === 'urbit') {
            app.color = cleanNounColor(app.color);
          }
          self.catalog.set(app.id, app);
        }
      }
      self.stalls.set(data.path, data.stall);
    },
    _clearStall(data: any) {
      self.stalls.set(data.path, StallModel.create());
    },
    _allyAdded(ship: string, desks: string[]) {
      if (self.addingAlly.get(ship)) {
        self.addingAlly.delete(ship);
      }
      // extra desk name from full desk path (i.e. <ship>/<desk>)
      for (let i = 0; i < desks.length; i++) {
        desks[i] = desks[i].split('/')[1];
      }
      self.allies.set(ship, { ship, desks });
      // this nice little 'new ally' event allows us to see if this ship
      //  has any apps available. if not, end the search (i.e. don't wait for
      //  treaties-loaded event since it will never happen)
      if (desks.length === 0) {
        self.loadingTreaties = false;
        // hmm.wondering if we should use this use-case to send a del to the treaty to remove
        //   this ally, to force a research if/when the user hits the ship again. keep
        //   an eye on this
      }
    },
    _allyDeleted(ship: string) {
      if (self.addingAlly.get(ship)) {
        self.addingAlly.delete(ship);
      }
      if (self.allies.has(ship)) {
        self.allies.delete(ship);
      }
    },
    _addRecommended(data: { id: string; stalls: any }) {
      self.recommendations.push(data.id);
      applySnapshot(self.stalls, data.stalls);
    },
    _removeRecommended(data: { id: string; stalls: any }) {
      const removeIndex = self.recommendations?.findIndex(
        (id: string) => id === data.id
      )!;
      self.recommendations.splice(removeIndex, 1);
      applySnapshot(self.stalls, data.stalls);
    },
    _treatiesLoaded() {
      self.loadingTreaties = false;
      self.treatiesLoaded = !self.treatiesLoaded;
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
      const idx = self.recentDevs.findIndex((item) => item === shipId);
      if (idx !== -1) self.recentDevs.splice(idx, 1);
      self.recentDevs.splice(0, 0, shipId);
    },
    installAppDirect: flow(function* (conduit: Conduit, body: InstallPoke) {
      try {
        return yield DocketApi.installApp(conduit, body.ship, body.desk);
      } catch (error) {
        console.error(error);
      }
    }),

    installApp: flow(function* (conduit: Conduit, body: InstallPoke) {
      try {
        return yield BazaarApi.installApp(conduit, body);
      } catch (error) {
        // self.installations.delete(body.desk);
        console.error(error);
      }
    }),
    uninstallApp: flow(function* (conduit: Conduit, body: UninstallPoke) {
      // Array.from(self.gridIndex.entries()).forEach(([key, value]) => {
      //   if (app.id === value) self.gridIndex.delete(key);
      // });
      try {
        // self.installations.delete(body.desk);
        return yield BazaarApi.uninstallApp(conduit, body);
      } catch (error) {
        console.error(error);
      }
    }),
    suspendApp: flow(function* (conduit: Conduit, desk: string) {
      try {
        return yield BazaarApi.suspendApp(conduit, desk);
      } catch (error) {
        console.error(error);
      }
    }),
    reviveApp: flow(function* (conduit: Conduit, desk: string) {
      try {
        return yield BazaarApi.resumeApp(conduit, desk);
      } catch (error) {
        console.error(error);
      }
    }),

    //
    // Pokes
    //
    pinApp: flow(function* (conduit: Conduit, body: PinPoke) {
      try {
        return yield BazaarApi.pinApp(conduit, body);
      } catch (error) {
        console.error(error);
      }
    }),
    unpinApp: flow(function* (conduit: Conduit, body: UnpinPoke) {
      try {
        return yield BazaarApi.unpinApp(conduit, body);
      } catch (error) {
        console.error(error);
      }
    }),
    addToSuite: flow(function* (conduit: Conduit, body: AddToSuitePoke) {
      try {
        return yield BazaarApi.addToSuite(conduit, body);
      } catch (error) {
        console.error(error);
      }
    }),
    removeFromSuite: flow(function* (
      conduit: Conduit,
      body: RemoveFromSuitePoke
    ) {
      try {
        return yield BazaarApi.removeFromSuite(conduit, body);
      } catch (error) {
        console.error(error);
      }
    }),
    recommendApp: flow(function* (conduit: Conduit, appId: string) {
      try {
        return yield BazaarApi.recommendApp(conduit, appId);
      } catch (error) {
        console.error(error);
      }
    }),
    unrecommendApp: flow(function* (conduit: Conduit, appId: string) {
      try {
        return yield BazaarApi.unrecommendApp(conduit, appId);
      } catch (error) {
        console.error(error);
      }
    }),
    addAlly: flow(function* (conduit: Conduit, ship: Patp) {
      try {
        if (self.allies.has(ship)) return;
        self.loadingTreaties = true;
        self.addingAlly.set(ship, 'adding');
        const result: any = yield BazaarApi.addAlly(conduit, ship);
        // self.loadingTreaties = false;
        return result;
      } catch (error) {
        console.error(error);
        self.loadingTreaties = false;
      }
    }),
    //
    // Scries
    //
    scryAllies: flow(function* (conduit: Conduit) {
      try {
        const allies = yield BazaarApi.scryAllies(conduit);
        for (const key in allies) {
          const desks = allies[key];
          for (let i = 0; i < desks.length; i++) {
            desks[i] = desks[i].split('/')[1];
          }
          self.allies.set(key, { ship: key, desks });
        }
        return;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),
    scryTreaties: flow(function* (conduit: Conduit, ship: Patp) {
      self.loadingTreaties = true;
      try {
        const treaties = yield BazaarApi.scryTreaties(conduit, ship);
        const formedTreaties = [];
        for (const key in treaties) {
          const treaty = treaties[key];
          const formed = {
            ...treaty,
            color: cleanNounColor(treaty.color),
            id: key,
          };
          formedTreaties.push(formed);
          self.treaties.set(key, {
            ...treaty,
            color: cleanNounColor(treaty.color),
            id: key,
          });
        }
        self.loadingTreaties = false;
        return formedTreaties;
      } catch (error) {
        console.error(error);
        self.loadingTreaties = false;
        throw error;
      }
    }),
    loadDevApps(devApps: any) {
      Object.values(devApps).forEach((app: any) => {
        self.devAppMap.set(app.id, DevAppModel.create(app));
      });
    },
  }))
  .views((self) => ({
    get installed() {
      return Array.from(self.gridIndex.entries())
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map((e) => self.catalog.get(e[1]));

      // return Array.from(Object.values(getSnapshot(self.catalog))).filter(
      //   (app: SnapshotOut<AppType>) => {
      //     if (app.type === 'urbit') {
      //       const urb = app as UrbitAppType;
      //       return (
      //         urb.installStatus === 'installed' ||
      //         urb.installStatus === 'suspended' ||
      //         urb.installStatus === 'resuming' ||
      //         urb.installStatus === 'failed'
      //       );
      //     } else {
      //       return true;
      //     }
      //   }
      // );
    },
    get devApps() {
      if (self.devAppMap.size === 0) return [];
      return Array.from(self.devAppMap.values()) || [];
    },
    getRecentApps() {
      return self.recentApps.map((appId) => self.catalog.get(appId));
    },
    getRecentDevs() {
      return self.recentDevs;
    },
    getAllies() {
      return Array.from(Object.values(getSnapshot(self.allies)));
    },
    getTreaties(ship: string) {
      return Array.from(Object.values(getSnapshot(self.treaties))).filter(
        (val) => val.id.split('/')[0] === ship
      );
    },
    getTreaty(ship: string, desk: string) {
      const treaty = self.treaties.get(`${ship}/${desk}`);
      return treaty && getSnapshot(treaty);
    },
    searchTreaties(ship: string, term: string) {
      const str = term.toLowerCase();
      return this.getTreaties(ship).filter((val) => {
        const tokens = val.id.split('/');
        return (
          tokens[0] === ship &&
          (val.title.toLowerCase().startsWith(str) ||
            tokens[1].startsWith(term))
        );
      });
    },
    searchApps(term: string) {
      const str = term.toLowerCase();
      return Array.from(Object.values(getSnapshot(self.catalog))).filter(
        (app) => {
          return (
            app.id.startsWith(term) || app.title.toLowerCase().startsWith(str)
          );
        }
      );
    },
    hasAlly(ship: Patp) {
      return self.allies.has(ship);
    },
    isPinned(path: string, appId: string) {
      return self.docks.get(path)?.includes(appId);
    },
    isRecommended(appId: string) {
      return self.recommendations.includes(appId);
    },
    getApp(appId: string) {
      const app = self.catalog.get(appId);
      if (!app) {
        // @ts-ignore
        return self.devAppMap.get(appId);
      }
      return app;
    },
    getDock(path: string) {
      return self.docks.get(path);
    },
    getDockApps(path: string) {
      const dock = self.docks.get(path);
      return dock?.map((appId: string) => {
        const app = self.catalog.get(appId);
        return app && getSnapshot(app);
      });
    },
    getStall(path: string) {
      const stall = self.stalls.get(path);
      return Array.from(Object.values(stall ? getSnapshot(stall) : {}));
    },
    getRecommendedApps(path: string) {
      const stall = self.stalls.get(path);
      if (!stall) return [];
      if (stall.recommended.size === 0) return [];
      return Array.from(
        Object.entries(getSnapshot(stall.recommended))
          .sort((entry: [string, number], entry2: [string, number]) => {
            return entry2[1] - entry[1];
          })
          .slice(0, 4)
          .map((entry: [appId: string, count: number]) => {
            return self.catalog.get(entry[0]);
          })
      );
    },
    getSuite(path: string) {
      const stall = self.stalls.get(path);
      const suite = new Map();
      if (!stall) return suite;
      Array.from(Object.keys(getSnapshot(stall.suite))).forEach(
        (index: string) => {
          const app = self.catalog.get(stall.suite.get(index)!);
          suite.set(index, app && getSnapshot(app));
        }
      );
      return suite;
    },
  }));

export type WebAppType = Instance<typeof WebApp>;

export type DocketAppType = Instance<typeof DocketApp>;
export type UrbitAppType = Instance<typeof UrbitApp>;
export type NativeAppType = Instance<typeof NativeApp>;
export type DevAppType = Instance<typeof DevAppModel>;
export type AppType = Instance<typeof AppModel>;
export type AllyType = Instance<typeof AllyModel>;
export type NewBazaarStoreType = Instance<typeof NewBazaarStore>;
export type RealmConfigType = Instance<typeof RealmConfig>;
