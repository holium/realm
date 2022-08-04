import { types, castToSnapshot } from 'mobx-state-tree';
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
  }));
