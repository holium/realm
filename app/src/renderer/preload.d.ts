import { RealmCorePreloadType } from './../core';
import { ShipPreloadType } from '../core/ship/manager';
import { AuthPreloadType } from '../core/auth/manager';
import { ThemePreloadType } from '../core/theme/manager';

declare global {
  interface Window {
    electron: {
      auth: AuthPreloadType;
      ship: ShipPreloadType;
      core: RealmCorePreloadType;
      theme: ThemePreloadType;
      app: {
        setFullscreen(callback: any): void;
        setAppviewPreload(callback: any): void;
        setMouseColor(callback: any): void;
        openApp(app: any): Promise<any>;
        closeApp(app: any): void;
        toggleDevTools(): void;
      };
    };
  }
}

export {};
