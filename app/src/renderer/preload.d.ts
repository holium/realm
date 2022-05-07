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
        setFullscreen(callback: any): void;
        openApp(app: any): void;
        closeApp(app: any): void;
      };
    };
  }
}

export {};
