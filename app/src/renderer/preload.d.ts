import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';

declare global {
  interface Window {
    electron: {
      app: AppPreloadType;
      os: OSPreloadType;
    };
    audio: any;
  }
}

export {};
