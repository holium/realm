import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';
import { authPreload } from 'os/realm.service';
import { shipPreload } from 'os/services-new/ship/ship.service';
import { roomsPreload } from 'os/services-new/ship/rooms.service';
import { authPreload } from 'os/services-new/auth/auth.service';
import { chatPreload } from 'os/services-new/ship/models/chat.model';
import { notifPreload } from 'os/services-new/ship/models/notifications.model';
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
    roomsService: typeof roomsPreload;
    chatDB: typeof chatPreload;
    notifDB: typeof notifPreload;
    realm: typeof realmPreload;
  }
}

export {};
