import { OSPreloadType } from '../../../app/src/tome/preload';

declare global {
  interface Window {
    ship: string;
    electron: {
      os: OSPreloadType;
    };
  }
}

export {};
