import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/index';

declare global {
  interface Window {
    electron: {
      app: AppPreloadType;
      os: OSPreloadType;
    };
  }
}

export {};
