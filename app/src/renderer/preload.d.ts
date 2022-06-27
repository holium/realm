import { OSPreloadType } from './../os/index';
import { RealmCorePreloadType } from '../core-a';
import { ShipPreloadType } from '../core-a/ship/manager';
import { AuthPreloadType } from '../core-a/auth/manager';
import { ThemePreloadType } from '../core-a/theme/manager';

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
        openApp(app: any, partition: string): void;
        setPartitionCookies: (partition: string, cookies: any) => void;
        closeApp(app: any): Promise<any>;
        toggleDevTools(): void;
      };
      os: OSPreloadType;
    };
  }
}

export {};
