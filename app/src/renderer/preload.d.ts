import { ShipManagerType } from '../core/ship/manager';
import { AuthManagerType } from '../core/auth/manager';

export interface IElectronAPI {
  auth: (ship: string, url: string, code: string) => Promise<any>;
}

declare global {
  interface Window {
    electron: {
      auth: AuthManagerType;
      ship: ShipManagerType;
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
