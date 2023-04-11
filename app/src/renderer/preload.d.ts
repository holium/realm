import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';
import { authPreload } from 'os/services-new/auth.service';
import { shipPreload } from 'os/services-new/ship/ship.service';
import { roomsPreload } from 'os/services-new/ship/rooms.service';
import { chatPreload } from 'os/services-new/ship/models/chat.model';
import { notifPreload } from 'os/services-new/ship/notifications.service';
import { friendsPreload } from 'os/services-new/ship/models/friends.model';
import { spacesPreload } from 'os/services-new/ship/spaces/spaces.service';
import { bazaarPreload } from 'os/services-new/ship/spaces/bazaar.service';

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
    chatService: typeof chatPreload;
    notifService: typeof notifPreload;
    friendDb: typeof friendsPreload;
    realm: typeof realmPreload;
    spacesService: typeof spacesPreload;
    bazaarService: typeof bazaarPreload;
  }
}

export {};
