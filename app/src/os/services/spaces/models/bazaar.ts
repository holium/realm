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
import { toJS } from 'mobx';
import { Conduit } from '@holium/conduit';
import { Patp } from '../../../types';
// const util = require('util');

export enum InstallStatus {
  uninstalled = 'uninstalled',
  initial = 'initial',
  started = 'started',
  failed = 'failed',
  installed = 'installed',
  treaty = 'treaty',
}

enum AppTypes {
  Urbit = 'urbit',
  Native = 'native',
  Web = 'web',
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
});

export const WebApp = types.model('WebApp', {
  id: types.identifier,
  title: types.string,
  href: types.string,
  favicon: types.maybeNull(types.string),
  type: types.literal(AppTypes.Web),
});

const UrbitApp = types.model('UrbitApp', {
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
});

const NativeApp = types.model('NativeApp', {
  id: types.identifier,
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.literal(AppTypes.Native),
  icon: types.maybeNull(types.string),
});

const AppModel = types.union(
  {
    eager: true,
  },
  UrbitApp,
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
    installations: types.map(types.string),
  })
  .actions((self) => ({
    // Updates
    _setAppStatus(appId: string, app: UrbitAppType) {
      if (app.installStatus === 'installed') {
        self.installations.delete(appId);
      }
      self.catalog.set(appId, {
        ...app,
        color: cleanNounColor(app.color),
      });
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
    },
    _addJoined(data: { path: string; stall: any; catalog: any }) {
      self.stalls.set(data.path, data.stall);
      Object.keys(data.catalog).forEach((key: string) => {
        const docket = data.catalog[key];
        if (docket.type === 'urbit') {
          data.catalog[key].color = cleanNounColor(data.catalog[key].color);
        }
      });
      self.catalog.merge(data.catalog);
    },
    _updateStall(data: {
      path: string;
      stall: { recommended: any; suite: any };
    }) {
      self.stalls.set(data.path, data.stall);
    },
    _allyAdded(ship: string) {
      if (self.addingAlly.get(ship)) {
        self.addingAlly.delete(ship);
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
    installApp: flow(function* (conduit: Conduit, body: InstallPoke) {
      self.installations.delete(body.desk);
      self.installations.set(body.desk, InstallStatus.started);
      try {
        return yield BazaarApi.installApp(conduit, body);
      } catch (error) {
        self.installations.delete(body.desk);
        console.error(error);
      }
    }),
    uninstallApp: flow(function* (conduit: Conduit, body: UninstallPoke) {
      try {
        self.installations.delete(body.desk);
        return yield BazaarApi.uninstallApp(conduit, body);
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
        self.addingAlly.set(ship, 'adding');
        return yield BazaarApi.addAlly(conduit, ship);
      } catch (error) {
        console.error(error);
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
        let formedTreaties = [];
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
  }))
  .views((self) => ({
    get installing() {
      return Array.from(Object.values(getSnapshot(self.catalog))).filter(
        (app: AppType) => {
          if (self.installations.get(app.id)) return true;
          return false;
        }
      );
    },
    get installed() {
      // return Array.from(self.gridIndex.entries()).sort((el: []) => {

      // })
      return Array.from(Object.values(getSnapshot(self.catalog))).filter(
        (app: AppType) => {
          const urb = app as UrbitAppType;
          return urb.installStatus === 'installed';
        }
      );
    },
    getRecentApps() {
      return [];
    },
    getRecentDevs() {
      return [];
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
      return self.catalog.get(appId);
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
      let suite = new Map();
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

export type DocketAppType = Instance<typeof DocketApp>;
export type UrbitAppType = Instance<typeof UrbitApp>;
export type NativeAppType = Instance<typeof NativeApp>;
export type AppType = Instance<typeof AppModel>;
export type AllyType = Instance<typeof AllyModel>;
export type NewBazaarStoreType = Instance<typeof NewBazaarStore>;
