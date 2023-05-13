import { observable, toJS } from 'mobx';
import {
  applySnapshot,
  flow,
  getSnapshot,
  Instance,
  SnapshotOut,
  types,
} from 'mobx-state-tree';

import { cleanNounColor } from '@holium/design-system';

import { AppRecentsIPC, BazaarIPC } from '../ipc';
import { LoaderModel } from './common.model';
import { Glob } from './docket.model';

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

export const RealmConfig = types.model('RealmConfig', {
  size: types.array(types.number),
  showTitlebar: types.boolean,
  titlebarBorder: types.boolean,
});

export const DocketApp = types.model('DocketApp', {
  id: types.string,
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
  id: types.string,
  title: types.string,
  href: types.string,
  favicon: types.maybeNull(types.string),
  type: types.literal(AppTypes.Web),
  config: types.maybeNull(RealmConfig),
  installStatus: types.optional(types.string, InstallStatus.installed),
});

export const UrbitApp = types
  .model('UrbitApp', {
    id: types.string,
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
    gridIndex: types.maybe(types.maybeNull(types.number)),
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
    setIsRecommended(isRecommended: boolean) {
      self.isRecommended = isRecommended;
    },
  }));

const NativeApp = types.model('NativeApp', {
  id: types.string,
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
    addingAlly: types.map(types.string),
    devAppMap: types.map(DevAppModel),
    installations: types.map(types.string),
    alliesLoader: types.optional(LoaderModel, { state: 'initial' }),
    treatyLoader: types.optional(LoaderModel, { state: 'initial' }),
    recentApps: types.array(types.string),
    recentDevs: types.array(types.string),
  })
  .extend((self) => {
    const treaties = observable.map(new Map<string, any>());
    const allies = observable.map(new Map<string, any>());
    return {
      views: {
        get installed(): SnapshotOut<AppMobxType>[] {
          const apps = Array.from<AppMobxType>(self.catalog.values())
            .map((app) => getSnapshot(app))
            .filter((app: SnapshotOut<AppMobxType>) => {
              if (app.gridIndex === null) {
                return false;
              } else if (app.type === 'urbit') {
                const urb = app as AppMobxType;
                return (
                  // 'started' installs should show on the desktop no?

                  urb.installStatus === 'started' ||
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
              if (a.gridIndex === undefined && b.gridIndex === undefined)
                return 0;
              if (a.gridIndex === undefined || a.gridIndex === null) return 1;
              if (b.gridIndex === undefined || b.gridIndex === null) return -1;
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
          return Array.from(toJS(allies).values());
        },
        getAlly(ship: string) {
          return allies.get(ship);
        },
        hasAlly(ship: string) {
          return allies.has(ship);
        },
        getTreaties(ship: string) {
          const filteredTreaties = Array.from(toJS(treaties).values()).filter(
            (val) => val.id.split('/')[0] === ship
          );
          return filteredTreaties;
        },
        getTreaty(ship: string, desk: string) {
          const treaty = treaties.get(`${ship}/${desk}`);
          return treaty && getSnapshot(treaty);
        },
        searchTreaties(ship: string, term: string) {
          const str = term.toLowerCase();
          const resultTreaties = this.getTreaties(ship).filter((val) => {
            const tokens = val.id.split('/');
            return (
              tokens[0] === ship &&
              (val.title.toLowerCase().startsWith(str) ||
                tokens[1].startsWith(term))
            );
          });
          return resultTreaties;
        },
        searchApps(term: string) {
          const str = term.toLowerCase();
          return Array.from(Object.values(getSnapshot(self.catalog))).filter(
            (app) => {
              return (
                app.id.startsWith(term) ||
                app.title.toLowerCase().startsWith(str)
              );
            }
          );
        },
        isRecommended(appId: string) {
          return self.recommendations.includes(appId);
        },
        getApp(appId: string) {
          const app = self.catalog.get(appId);
          if (app) return toJS(app);
          return self.devAppMap.get(appId);
        },
      },
      actions: {
        init: flow(function* () {
          const data = yield BazaarIPC.fetchAppCatalog();
          AppRecentsIPC.getRecentDesks().then((res) => {
            applySnapshot(
              self.recentApps,
              res.map((row) => row.desk)
            );
          });
          AppRecentsIPC.getRecentPublishers().then((res) => {
            applySnapshot(
              self.recentDevs,
              res.map((row) => row.publisher)
            );
          });
          applySnapshot(self.catalog, data);
        }),
        _onInitialLoad(catalog: any) {
          applySnapshot(self.catalog, catalog);
        },

        reset() {
          self.catalog.clear();
          self.gridIndex.clear();
          self.recentApps.clear();
          self.recentDevs.clear();
        },

        addRecentApp: flow(function* (appId: string) {
          yield AppRecentsIPC.addRecentDesk(appId);
          // keep no more than 5 recent app entries
          if (self.recentApps.length >= 5) {
            self.recentApps.pop();
          }
          // move the app up to the top if it already exists in the list
          const idx = self.recentApps.findIndex((item) => item === appId);
          if (idx !== -1) self.recentApps.splice(idx, 1);
          // add app to front of list
          self.recentApps.splice(0, 0, appId);
        }),
        addRecentDev: flow(function* (shipId: string) {
          yield AppRecentsIPC.addRecentPublisher(shipId);
          // // keep no more than 5 recent app entries
          if (self.recentDevs.length >= 5) {
            self.recentDevs.pop();
          }
          const idx = self.recentDevs.findIndex((item) => item === shipId);
          if (idx !== -1) self.recentDevs.splice(idx, 1);
          self.recentDevs.splice(0, 0, shipId);
        }),
        //
        // Pokes
        //
        installApp: flow(function* (ship: string, desk: string) {
          let app: any | undefined = self.catalog.get(desk);
          if (!app) {
            const treaty: DocketAppType | undefined = treaties.get(
              `${ship}/${desk}`
            );

            if (treaty) {
              app = UrbitApp.create({
                ...toJS(treaty),
                type: AppTypes.Urbit,
                installStatus: InstallStatus.started,
              });
              self.catalog.set(desk, app);
            }
          }
          try {
            if (app) {
              app.setStatus(InstallStatus.started);
              self.installations.set(app.id, InstallStatus.started);
            }
            return yield BazaarIPC.installApp(ship, desk);
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
            self.installations.delete(app.id);
            try {
              return yield BazaarIPC.uninstallApp(desk);
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
            return yield BazaarIPC.suspendApp(desk);
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
            return yield BazaarIPC.reviveApp(desk);
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
            return yield BazaarIPC.recommendApp(appId);
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

            return yield BazaarIPC.unrecommendApp(appId);
          } catch (error) {
            console.error(error);
          }
        }),
        addAlly: flow(function* (ship: string) {
          try {
            const alliesResponse = yield BazaarIPC.scryAllies();
            if (
              alliesResponse[ship] &&
              alliesResponse[ship].status === 'loaded'
            ) {
              console.log('already added ally', ship);
              return;
            }
            self.addingAlly.set(ship, 'adding new ally');
            const result: any = yield BazaarIPC.addAlly(ship);
            return result;
          } catch (error) {
            console.error(error);
          }
        }),

        removeAlly: flow(function* (ship: string) {
          try {
            const result: any = yield BazaarIPC.removeAlly(ship);
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
            return yield BazaarIPC.scryHash(app);
          } catch (error) {
            console.error(error);
          }
        }),
        scryAllies: flow(function* () {
          self.alliesLoader.set('loading');
          try {
            const alliesResponse = yield BazaarIPC.scryAllies();
            for (const key in alliesResponse) {
              const desks = alliesResponse[key];
              for (let i = 0; i < desks.length; i++) {
                desks[i] = desks[i].split('/')[1];
              }
              allies.set(key, { ship: key, desks });
            }
            self.alliesLoader.set('loaded');
            return;
          } catch (error) {
            console.error(error);
            throw error;
          }
        }),
        scryTreaties: flow(function* (ship: string) {
          try {
            self.treatyLoader.set('loading');
            treaties.clear();
            const treatiesResponse = yield BazaarIPC.scryTreaties(ship);
            if (Object.keys(treatiesResponse).length === 0) {
              return;
            }
            const formedTreaties = [];
            for (const key in treatiesResponse) {
              const treaty = treatiesResponse[key];
              const formed = {
                ...toJS(treaty),
                color: cleanNounColor(treaty.color),
                id: key,
              };
              formedTreaties.push(formed);
              treaties.set(key, {
                ...toJS(treaty),
                color: cleanNounColor(treaty.color),
                id: key,
              });
            }
            self.treatyLoader.set('loaded');
            return formedTreaties;
          } catch (error) {
            console.error(error);
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
        _addAlly(ship: string, data: any) {
          allies.set(ship, data);
        },
        _removeAlly(ship: string) {
          allies.delete(ship);
        },
        _onTreatyUpdate(ship: string, data: any) {
          treaties.set(ship, data);
        },
      },
    };
  });

export type AppMobxType = Instance<typeof UrbitApp>;
export type WebAppType = Instance<typeof WebApp>;

export type DocketAppType = Instance<typeof DocketApp>;
export type NativeAppType = Instance<typeof NativeApp>;
export type DevAppType = Instance<typeof DevAppModel>;
export type AppType = Instance<typeof AppModel>;
export type AllyType = Instance<typeof AllyModel>;
export type BazaarStoreType = Instance<typeof BazaarStore>;
export type RealmConfigType = Instance<typeof RealmConfig>;
