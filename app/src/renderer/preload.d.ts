import { RealmCorePreloadType } from './../core';
import { ShipPreloadType } from '../core/ship/manager';
import { AuthPreloadType } from '../core/auth/manager';
declare global {
  interface Window {
    electron: {
      auth: AuthPreloadType;
      ship: ShipPreloadType;
      core: RealmCorePreloadType;
      app: {
        openApp(config: any, data: any): void;
        closeApp(app: any): void;
      };
    };
  }
}

export {};
