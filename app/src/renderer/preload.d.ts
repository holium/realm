import { OSPreloadType } from './../os/index';

declare global {
  interface Window {
    electron: {
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
