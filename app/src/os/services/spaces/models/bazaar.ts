import { toJS } from 'mobx';
import { types, castToSnapshot, Instance } from 'mobx-state-tree';
import { SpacePath } from 'os/types';
import { NativeAppList } from '../../../../renderer/apps';
import { DocketApp, WebApp } from '../../ship/models/docket';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

export const BazaarModel = types
  .model({
    pinned: types.array(types.string),
    endorsed: DocketMap, // recommended
    installed: DocketMap, // registered
  })
  .views((self) => ({
    get pinnedApps() {
      const pins = self.pinned;
      return [...Array.from(self.installed!.values()), ...NativeAppList]
        .filter((app: any) => self.pinned.includes(app.id))
        .sort((a, b) => pins.indexOf(a.id) - pins.indexOf(b.id));
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
  }));
export type BazaarModelType = Instance<typeof BazaarModel>;

export const BazaarStore = types
  .model({
    spaces: types.map(BazaarModel),
  })
  .views((self) => ({
    getBazaar(path: string) {
      return self.spaces.get(path);
    },
    // get pinnedApps() {
    //   const pins = self.pinned;
    //   return [...Array.from(self.installed!.values()), ...NativeAppList]
    //     .filter((app: any) => self.pinned.includes(app.id))
    //     .sort((a, b) => pins.indexOf(a.id) - pins.indexOf(b.id));
    // },
    // isAppPinned(appId: string) {
    //   return self.pinned.includes(appId);
    // },
    // getAppData(appId: string) {
    //   const apps = Array.from(self.installed.values());
    //   return [...apps, ...NativeAppList].find((app: any) => app.id === appId);
    // },
  }))
  .actions((self) => ({
    our(ourPath: string, shipApps: any) {
      const ourBazaar = BazaarModel.create({
        pinned: [],
        installed: shipApps,
      });
      self.spaces.set(ourPath, ourBazaar);
    },
    apps(spacePath: SpacePath, apps: any) {
      const spaceBazaar = BazaarModel.create({
        pinned: [],
        installed: apps,
      });
      self.spaces.set(spacePath, spaceBazaar);
    },
    // initial(shipApps: any) {
    //   self.installed = shipApps;
    // },
    // loadPins(pins: string[]) {
    //   self.pinned = castToSnapshot(pins);
    // },
  }));

export type BazaarStoreType = Instance<typeof BazaarStore>;
