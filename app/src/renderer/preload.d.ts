import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';
import { shipPreload } from 'os/services-new/ship/ship.service';
import { authPreload } from 'os/services-new/auth/auth.service';

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
    shipService: typeof shipPreload;
    authService: typeof authPreload;
  }
}

export {};
