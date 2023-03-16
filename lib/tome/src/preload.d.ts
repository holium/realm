import { TomePreloadType } from '../../../app/src/tome/preload';

declare global {
  interface Window {
    ship: string;
    electron: {
      tome: TomePreloadType;
    };
  }
}

export {};
