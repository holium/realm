import { AppPreloadType } from 'main/preload';
import { MultiplayerPreloadType } from 'main/preload.multiplayer';
import { OSPreloadType } from 'os/preload';

declare global {
  interface Window {
    electron: {
      os: OSPreloadType;
      app: AppPreloadType;
      multiplayer: MultiplayerPreloadType;
    };
    audio: any;
    ship: string;
    twttr: any;
  }
}

export {};
