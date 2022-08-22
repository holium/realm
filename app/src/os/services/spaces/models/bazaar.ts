import { types, castToSnapshot, Instance } from 'mobx-state-tree';
import { SpacePath } from 'os/types';
import { NativeAppList } from '../../../../renderer/apps';
import { DocketApp, WebApp } from '../../ship/models/docket';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

const BazaarApp = types.model({
  id: types.string,
  tags: types.array(types.string),
});
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
    get pinnedApps() {
      const pins = self.pinned;
      return [...Array.from(self.installed!.values()), ...NativeAppList]
        .filter((app: any) => self.pinned.includes(app.id))
        .sort((a, b) => pins.indexOf(a.id) - pins.indexOf(b.id));
    },
    get recentApps() {
      const recents = self.recentsApps;
      return [...Array.from(self.installed!.values()), ...NativeAppList]
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
      return self.pinned.includes(appId);
    },
    getAppData(appId: string) {
      const apps = Array.from(self.installed.values());
      return [...apps, ...NativeAppList].find((app: any) => app.id === appId);
    },
  }))
  .actions((self) => ({
    initial(shipApps: any) {
      self.installed = shipApps;
    },
    loadPins(pins: string[]) {
      self.pinned = castToSnapshot(pins);
    },
    pinApp(appId: string) {
      self.pinned.push(appId);
    },
    unpinApp(appId: string) {
      self.pinned.remove(appId);
    },
    setPinnedOrder(newOrder: any) {
      self.pinned = newOrder;
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
    setAllies(items: string[]) {
      self.allies.splice(0, 0, ...items);
    },
  }));
export type BazaarModelType = Instance<typeof BazaarModel>;

export const BazaarStore = types
  .model({
    spaces: types.map(BazaarModel),
  })
  .views((self) => ({
    getBazaar(path: string) {
      console.log('getBazaar => %o', path);
      return self.spaces.get(path);
    },
  }))
  .actions((self) => ({
    our(ourPath: string, shipApps: any) {
      const ourBazaar = BazaarModel.create({
        pinned: [],
        installed: shipApps,
      });
      self.spaces.set(ourPath, ourBazaar);
    },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
