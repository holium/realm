import { RealmCorePreloadType } from './../core';
import { ShipPreloadType } from '../core/ship/manager';
import { AuthPreloadType } from '../core/auth/manager';
declare global {
  interface Window {
    electron: {
      auth: AuthPreloadType;
      ship: ShipPreloadType;
      core: RealmCorePreloadType;
      ipcRenderer: {
        myPing(): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
