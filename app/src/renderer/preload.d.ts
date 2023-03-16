import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';
import { MultiplayerPreloadType } from 'main/preload.multiplayer';

declare global {
  interface Window {
    electron: {
      os: OSPreloadType;
      app: AppPreloadType;
      multiplayer: MultiplayerPreloadType;
    };
    audio: any;
    ship: string;
    mouseLayerTracking: boolean;
  }
}

export {};
