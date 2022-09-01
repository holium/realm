import { types, Instance } from 'mobx-state-tree';
import { cleanNounColor } from '../../../lib/color';
import { NativeAppList } from '../../../../renderer/apps';
import { DocketApp, WebApp, Glob, AppTypes } from '../../ship/models/docket';
import { toJS } from 'mobx';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

const AppRankModel = types.model({
  default: types.number,
  pinned: types.number,
  recommended: types.number,
  suite: types.number,
});

const BazaarApp = types.model({
  id: types.identifier,
  // ship: types.string,
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

export const BazaarModel = types
  .model({
    recentsApps: types.array(types.string),
    recentsDevs: types.array(types.string),
    apps: types.map(BazaarApp),
  })
  .views((self) => ({
    get allApps() {
      console.log('BazaarModel.allApps => %o', Array.from(self.apps!.values()));
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
      return [...Array.from(self.apps!.values()), ...NativeAppList]
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
    findApps(searchString: string) {
      const matches = [];
      const str = searchString.toLowerCase();
      console.log('searching for %o in %o...', searchString, toJS(self.apps));
      for (const app of self.apps) {
        if (app[1].title.toLowerCase().startsWith(str)) {
          matches.push(app[1]);
        }
      }
      return matches;
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
  }));
export type BazaarModelType = Instance<typeof BazaarModel>;

export const BazaarStore = types
  .model({
    // all apps installed on the local ship (our)
    // ourApps: types.map(BazaarApp),
    // space => app metadata for space specific app data
    spaces: types.map(BazaarModel),
    // apps: types.map(BazaarApp),
    treaties: types.map(
      types.model({
        key: types.identifier,
        cass: types.model({
          da: types.string,
        }),
        image: types.string,
        title: types.string,
        license: types.string,
        version: types.string,
        desk: types.string,
        website: types.string,
        ship: types.string,
        href: types.model({
          glob: Glob,
        }),
        hash: types.string,
        color: types.string,
        info: types.string,
      })
    ),
    allies: types.map(
      types.model({
        alliance: types.identifier,
        ship: types.string,
      })
    ),
  })
  .views((self) => ({
    getBazaar(path: string) {
      return self.spaces.get(path);
    },
  }))
  .actions((self) => ({
    initial(apps: any) {
      // applySnapshot(self.spaces, apps['space-apps']);
      const catalog = apps['space-apps'];
      console.log('initial => %o', catalog);
      for (const spacePath in catalog) {
        const spaceApps = catalog[spacePath];
        const bazaar = BazaarModel.create({});
        for (const desk in spaceApps) {
          const app = spaceApps[desk];
          const appColor = app.color;
          app.color = appColor && cleanNounColor(appColor);
          // if (spacePath.endsWith('/our')) {
          //   console.log('adding app to catalog => %o', app);
          //   self.apps.set(app.id, app);
          // }
          bazaar.addApp(app);
        }
        self.spaces.set(spacePath, bazaar);
      }
    },
    findApps(searchString: string) {
      const matches = [];
      const str = searchString.toLowerCase();
      console.log('searching for %o in %o...', searchString, toJS(self.apps));
      for (const app of self.apps) {
        if (app[1].title.toLowerCase().startsWith(str)) {
          matches.push(app[1]);
        }
      }
      return matches;
    },
    // addApp(app: any) {
    //   self.apps.set(app.id, app);
    // },
    // removeApp(app: any) {
    //   self.apps.delete(app.id);
    // },
    hasAlly(ally: any) {
      return self.allies.has(ally.alliance[0]);
    },
    addAlly(ally: any) {
      self.allies.set(ally.alliance[0], ally.ship);
    },
    addTreaty(treaty: any) {
      // self.treaties.push(`${treaty.ship}/${treaty.desk}`);
      const key = `${treaty.ship}/${treaty.desk}`;
      self.treaties.set(key, {
        ...treaty,
        key: key,
      });
    },
    initialTreaties(treaties: any) {
      for (const key in treaties) {
        const val = treaties[key];
        self.treaties.set(key, {
          ...val,
          key: key,
        });
      }
      // self.treaties.splice(0, 0, treaties);
    },
    addBazaar(path: string) {
      console.log('addBazaar => %o', path);
      self.spaces.set(path, BazaarModel.create({}));
    },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
