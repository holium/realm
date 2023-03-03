import { AppPreloadType } from '../../../app/src/main/preload';

declare global {
  interface Window {
    ship: string;
    electron: {
      app: AppPreloadType;
    };
  }
}

export {};
