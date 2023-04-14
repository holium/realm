import {
  types,
  Instance,
  getSnapshot,
  applySnapshot,
  flow,
  SnapshotOut,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { cleanNounColor } from 'os/lib/color';
import { BazaarIPC } from '../ipc';
import { shipStore } from '../ship.store';

export enum InstallStatus {
  uninstalled = 'uninstalled',
  initial = 'initial',
  started = 'started',
  failed = 'failed',
  installed = 'installed',
  treaty = 'treaty',
  suspended = 'suspended',
  suspending = 'suspending',
  reviving = 'reviving',
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

export type GlobMobxType = Instance<typeof Glob>;

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
  info: types.optional(types.string, ''),
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

export const UrbitApp = types
  .model('UrbitApp', {
    id: types.identifier,
    title: types.string,
    info: types.maybeNull(types.string),
    color: types.string,
    favicon: types.maybeNull(types.string),
    type: types.union(
      types.literal(AppTypes.Urbit),
      types.literal(AppTypes.Web),
      types.literal(AppTypes.Native)
    ),
    image: types.maybeNull(types.string),
    href: types.union(Glob, types.string, types.null),
    version: types.maybeNull(types.string),
    website: types.maybeNull(types.string),
    license: types.maybeNull(types.string),
    installStatus: types.string,
    icon: types.maybeNull(types.string), // native app only
    host: types.maybeNull(types.string),
    config: types.maybeNull(RealmConfig),
    gridIndex: types.maybe(types.number),
    dockIndex: types.maybe(types.number),
    isRecommended: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setHost(host: string) {
      self.host = host;
    },
    setConfig(config: any) {
      self.config = config;
    },
    setStatus(status: InstallStatus) {
      self.installStatus = status;
    },
    setGridIndex(index: number) {
      self.gridIndex = index;
    },
    setDockIndex(index: number | undefined) {
      self.dockIndex = index;
    },
    setIsRecommended(isRecommended: boolean) {
      self.isRecommended = isRecommended;
    },
  }));

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
  UrbitApp
);

const AppId = types.string;
const AllyModel = types.model('AllyModel', {
  ship: types.identifier,
  desks: types.optional(types.array(types.string), []),
});

export const BazaarStore = types
  .model('BazaarStore', {
    recommendations: types.array(AppId),
    catalog: types.map(UrbitApp),
    gridIndex: types.map(AppId),
    treaties: types.map(DocketApp),
    allies: types.map(AllyModel),
    loadingAllies: false,
    loadingTreaties: false,
    addingAlly: types.map(types.string),
    devAppMap: types.map(DevAppModel),
    installations: types.map(types.string),
    treatiesLoaded: types.optional(types.boolean, false),
    recentApps: types.array(types.string),
    recentDevs: types.array(types.string),
  })
  .views((self) => ({
    get installed(): SnapshotOut<AppMobxType>[] {
      const apps = Array.from<AppMobxType>(self.catalog.values())
        .map((app) => getSnapshot(app))
        .filter((app: SnapshotOut<AppMobxType>) => {
          if (app.type === 'urbit') {
            const urb = app as AppMobxType;
            return (
              urb.installStatus === 'installed' ||
              urb.installStatus === 'suspended' ||
              urb.installStatus === 'resuming' ||
              urb.installStatus === 'failed' ||
              urb.installStatus === 'suspending' ||
              urb.installStatus === 'reviving'
            );
          } else {
            return true;
          }
        })
        .slice()
        .sort((a, b) => {
          if (a.gridIndex === undefined && b.gridIndex === undefined) return 0;
          if (a.gridIndex === undefined) return 1;
          if (b.gridIndex === undefined) return -1;
          return a.gridIndex - b.gridIndex;
        });
      return apps;
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
    hasAlly(ship: string) {
      return self.allies.has(ship);
    },
    isRecommended(appId: string) {
      return self.recommendations.includes(appId);
    },
    getApp(appId: string) {
      const app = self.catalog.get(appId);
      if (app) return app;
      return self.devAppMap.get(appId);
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      const data = yield BazaarIPC.fetchAppCatalog() as Promise<any>;
      console.log('catalog', data);
      applySnapshot(self.catalog, data);
      // const { apps, gridIndex, recentApps, recentDevs } = data;
      // self.catalog.clear();
      // self.gridIndex.clear();
      // self.recentApps.clear();
      // self.recentDevs.clear();
      // apps.forEach((app: UrbitAppType) => {
      //   self.catalog.set(app.id, {
      //     ...app,
      //     color: cleanNounColor(app.color),
      //   });
      // });
      // applySnapshot(self.gridIndex, gridIndex);
      // self.recentApps.push(...recentApps);
      // self.recentDevs.push(...recentDevs);
    }),
    // Updates
    // _setAppStatus(appId: string, app: UrbitAppType, gridIndex: any) {
    //   self.catalog.set(appId, {
    //     ...app,
    //     color: cleanNounColor(app.color),
    //   });
    //   applySnapshot(self.gridIndex, gridIndex);
    // },
    // _addPinned(data: { path: string; id: string; index: number }) {
    //   if (!self.docks.has(data.path)) {
    //     self.docks.set(data.path, []);
    //   }
    //   const dock = self.docks.get(data.path);
    //   dock?.push(data.id);
    //   self.docks.set(data.path, dock);
    // },
    // _removePinned(data: { path: string; id: string }) {
    //   const dock = self.docks.get(data.path);
    //   const removeIndex = dock?.findIndex((id: string) => id === data.id);
    //   if (removeIndex) dock?.splice(removeIndex, 1);
    //   self.docks.set(data.path, dock);
    // },
    // _reorderPins(data: { path: string; dock: string[] }) {
    //   self.docks.set(data.path, data.dock);
    // },
    // _suiteAdded(data: { path: string; id: string; index: number }) {
    //   const stall = self.stalls.get(data.path);
    //   if (!stall) return;
    //   stall?.suite.set(`${data.index}`, data.id);
    //   self.stalls.set(data.path, stall);
    // },
    // _suiteRemoved(data: { path: string; index: number }) {
    //   const stall = self.stalls.get(data.path);
    //   if (!stall) return;
    //   stall.suite.delete(`${data.index}`);
    //   self.stalls.set(data.path, stall);
    // },

    // _addJoined(data: { path: string; stall: any; catalog: any }) {
    //   Object.keys(data.catalog).forEach((key: string) => {
    //     const docket = data.catalog[key];
    //     if (docket.type === 'urbit') {
    //       // Set new apps in catalog
    //       const app = self.catalog.get(key);
    //       if (!app) {
    //         data.catalog[key].color = cleanNounColor(data.catalog[key].color);
    //         self.catalog.set(key, data.catalog[key]);
    //       } else {
    //         if (!(app as UrbitAppType).host && data.catalog[key].host) {
    //           // add host to existing app
    //           (app as UrbitAppType).setHost(data.catalog[key].host);
    //           self.catalog.set(key, app);
    //         }
    //       }
    //     }
    //   });
    //   self.stalls.set(data.path, data.stall);
    // },
    // _updateStall(data: any) {
    //   if ('add-app' in data) {
    //     const app: AppType = data['add-app'];
    //     if (app.type === 'urbit') {
    //       app.color = cleanNounColor(app.color);
    //     }
    //     self.catalog.set(app.id, app);
    //   } else if ('remove-app' in data) {
    //     // const appId: string = data['remove-app'];
    //   }
    //   self.stalls.set(data.path, data.stall);
    // },
    // _rebuildCatalog(data: any) {
    //   if (data.catalog) {
    //     for (let i = 0; i < data.catalog.length; i++) {
    //       const app: AppType = data.catalog[i];
    //       if (app.type === 'urbit') {
    //         app.color = cleanNounColor(app.color);
    //       }
    //       self.catalog.set(app.id, app);
    //     }
    //   }
    //   self.gridIndex.clear();
    //   applySnapshot(self.gridIndex, data.grid);
    // },
    // _rebuildStall(data: any) {
    //   if (data.catalog) {
    //     for (let i = 0; i < data.catalog.length; i++) {
    //       const app: AppType = data.catalog[i];
    //       if (app.type === 'urbit') {
    //         app.color = cleanNounColor(app.color);
    //       }
    //       self.catalog.set(app.id, app);
    //     }
    //   }
    //   self.stalls.set(data.path, data.stall);
    // },
    // _clearStall(data: any) {
    //   self.stalls.set(data.path, StallModel.create());
    // },
    // _allyAdded(ship: string, desks: string[]) {
    //   if (self.addingAlly.get(ship)) {
    //     self.addingAlly.delete(ship);
    //   }
    //   // extra desk name from full desk path (i.e. <ship>/<desk>)
    //   for (let i = 0; i < desks.length; i++) {
    //     desks[i] = desks[i].split('/')[1];
    //   }
    //   self.allies.set(ship, { ship, desks });
    //   // this nice little 'new ally' event allows us to see if this ship
    //   //  has any apps available. if not, end the search (i.e. don't wait for
    //   //  treaties-loaded event since it will never happen)
    //   if (desks.length === 0) {
    //     self.loadingTreaties = false;
    //     // hmm.wondering if we should use this use-case to send a del to the treaty to remove
    //     //   this ally, to force a research if/when the user hits the ship again. keep
    //     //   an eye on this
    //   }
    // },
    // _allyDeleted(ship: string) {
    //   if (self.addingAlly.get(ship)) {
    //     self.addingAlly.delete(ship);
    //   }
    //   if (self.allies.has(ship)) {
    //     self.allies.delete(ship);
    //   }
    // },
    // _addRecommended(data: { id: string; stalls: any }) {
    //   self.recommendations.push(data.id);
    //   applySnapshot(self.stalls, data.stalls);
    // },
    // _removeRecommended(data: { id: string; stalls: any }) {
    //   const removeIndex = self.recommendations?.findIndex(
    //     (id: string) => id === data.id
    //   );
    //   self.recommendations.splice(removeIndex, 1);
    //   applySnapshot(self.stalls, data.stalls);
    // },
    // _treatiesLoaded() {
    //   self.loadingTreaties = false;
    //   self.treatiesLoaded = !self.treatiesLoaded;
    // },
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
    //
    // Pokes
    //
    installApp: flow(function* (ship: string, desk: string) {
      const app = self.catalog.get(desk);
      try {
        if (app) {
          app.setStatus(InstallStatus.started);
          self.installations.set(app.id, InstallStatus.started);
        }
        return yield BazaarIPC.installApp(ship, desk) as Promise<any>;
      } catch (error) {
        if (app) {
          app.setStatus(InstallStatus.failed);
          self.installations.delete(app.id);
        }
        console.error(error);
      }
    }),
    uninstallApp: flow(function* (desk: string) {
      Array.from(self.gridIndex.entries()).forEach(([key, value]) => {
        if (desk === value) self.gridIndex.delete(key);
      });
      const app = self.catalog.get(desk);
      if (app) {
        app.setStatus(InstallStatus.uninstalled);
        self.gridIndex.delete(desk);
        console.log('uninstalling app', desk);
        try {
          return yield BazaarIPC.uninstallApp(desk) as Promise<any>;
        } catch (error) {
          console.error(error);
          self.gridIndex.set(`${self.gridIndex.size + 1}`, desk);
          app.setStatus(InstallStatus.installed);
        }
      }
    }),
    suspendApp: flow(function* (desk: string) {
      const app = self.catalog.get(desk);
      if (!app) return;
      if (app.installStatus === InstallStatus.suspended) {
        self.installations.delete(app.id);
        return;
      }
      app.setStatus(InstallStatus.suspending);
      self.installations.set(app.id, InstallStatus.suspending);
      try {
        return yield BazaarIPC.suspendApp(desk) as Promise<any>;
      } catch (error) {
        console.error(error);
        if (app) {
          app.setStatus(InstallStatus.failed);
          self.installations.delete(app.id);
        }
      }
    }),
    reviveApp: flow(function* (desk: string) {
      const app = self.catalog.get(desk);
      if (!app) return;
      if (app.installStatus === InstallStatus.installed) {
        self.installations.delete(app.id);
        return;
      }
      app.setStatus(InstallStatus.reviving);
      self.installations.set(app.id, InstallStatus.reviving);
      try {
        return yield BazaarIPC.reviveApp(desk) as Promise<any>;
      } catch (error) {
        console.error(error);
        if (app) {
          app.setStatus(InstallStatus.failed);
          self.installations.delete(app.id);
        }
      }
    }),
    recommendApp: flow(function* (appId: string) {
      try {
        self.recommendations.push(appId);
        return yield BazaarIPC.recommendApp(appId) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    unrecommendApp: flow(function* (appId: string) {
      try {
        applySnapshot(
          self.recommendations,
          self.recommendations.filter((id: string) => id !== appId)
        );

        return yield BazaarIPC.unrecommendApp(appId) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    addAlly: flow(function* (ship: string) {
      try {
        if (self.allies.has(ship)) return;
        self.loadingTreaties = true;
        self.addingAlly.set(ship, 'adding');
        const result: any = yield BazaarIPC.addAlly(ship) as Promise<any>;
        // self.loadingTreaties = false;
        return result;
      } catch (error) {
        console.error(error);
        self.loadingTreaties = false;
      }
    }),

    removeAlly: flow(function* (ship: string) {
      try {
        const result: any = yield BazaarIPC.removeAlly(ship) as Promise<any>;
        return result;
      } catch (error) {
        console.error(error);
      }
    }),
    //
    // Scries
    //
    scryHash: flow(function* (app: string) {
      try {
        return yield BazaarIPC.scryHash(app) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    scryAllies: flow(function* () {
      try {
        const allies = yield BazaarIPC.scryAllies() as Promise<any>;
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
    scryTreaties: flow(function* (ship: string) {
      self.loadingTreaties = true;
      try {
        self.treaties.clear();
        const treaties = yield BazaarIPC.scryTreaties(ship) as Promise<any>;
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
    loadDevApps(devApps: Record<string, DevAppType>) {
      Object.values(devApps).forEach((app) => {
        self.devAppMap.set(app.id, DevAppModel.create(app));
      });
    },
    // helpers
    setAppDuringInstallation(app: AppType, status: InstallStatus) {
      const install = self.installations.get(app.id);
      // console.log('current install status', install, 'new status', status);
      // Handles the case where an app is suspended on reviving
      if (
        install === InstallStatus.reviving &&
        status === InstallStatus.suspended
      ) {
        return;
      }

      if (
        !install &&
        (status === InstallStatus.suspended ||
          status === InstallStatus.uninstalled)
      ) {
        // this is when an app is suspended on install
        self.installations.set(app.id, status);
        return;
      }
      if (status === InstallStatus.started) {
        self.installations.set(app.id, status);
        return;
      }
      if (
        status === InstallStatus.uninstalled ||
        status === InstallStatus.installed ||
        status === InstallStatus.suspended ||
        status === InstallStatus.failed
      ) {
        self.installations.delete(app.id);
        return;
      }
    },
    // onUpdate handlers
    _onInstallationUpdate(update: any) {
      const app = self.catalog.get(update.id);
      const curStatus = self.installations.get(update.id);
      // Handles the case where the agent update is suspended on reviving
      if (
        curStatus === InstallStatus.reviving &&
        update.installStatus === InstallStatus.suspended
      ) {
        return;
      }
      if (!app) {
        // add to catalog
        self.catalog.set(update.id, AppModel.create(update));
      } else {
        app.setStatus(update.installStatus);
      }
      this.setAppDuringInstallation(update, update.installStatus);
    },
    _onRecommendedUpdate(appId: string) {
      const app = self.catalog.get(appId);
      if (app) app.setIsRecommended(true);
    },
    _onUnrecommendedUpdate(appId: string) {
      const app = self.catalog.get(appId);
      if (app) app.setIsRecommended(false);
    },
    _onPinnedUpdate(appId: string, index: number | undefined) {
      const app = self.catalog.get(appId);
      if (app) app.setDockIndex(index);
    },
  }));

export type AppMobxType = Instance<typeof UrbitApp>;
export type WebAppType = Instance<typeof WebApp>;

export type DocketAppType = Instance<typeof DocketApp>;
export type NativeAppType = Instance<typeof NativeApp>;
export type DevAppType = Instance<typeof DevAppModel>;
export type AppType = Instance<typeof AppModel>;
export type AllyType = Instance<typeof AllyModel>;
export type BazaarStoreType = Instance<typeof BazaarStore>;
export type RealmConfigType = Instance<typeof RealmConfig>;

BazaarIPC.onUpdate((_event: any, update: any) => {
  const { type, payload } = update;
  // on update we need to requery the store
  switch (type) {
    case 'initial':
      // shipStore.bazaarStore.loadDevApps(payload.devApps);
      // shipStore.bazaarStore.loadDevs(payload.devs);
      break;
    case 'installation-update':
      shipStore.bazaarStore._onInstallationUpdate(payload);
      break;
    case 'recommended':
      shipStore.bazaarStore._onRecommendedUpdate(payload.appId);
      break;
    case 'unrecommended':
      shipStore.bazaarStore._onUnrecommendedUpdate(payload.appId);
      break;
    case 'pinned-update':
      shipStore.bazaarStore._onPinnedUpdate(payload.app.id, payload.index);
      break;
    case 'pins-reordered':
      shipStore.bazaarStore._onUnrecommendedUpdate(payload.appId);
      break;
  }
});