export interface IElectronAPI {
  auth: (ship: string, url: string, code: string) => Promise<any>;
}

declare global {
  interface Window {
    electron: {
      auth: {
        addShip: (ship: string, url: string, code: string) => Promise<any>;
        removeShip: (ship: string) => Promise<any>;
        getShips: () => Promise<any>;
      };
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
