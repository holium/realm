import { AppPreloadType } from 'main/preload';
import { realmPreload } from 'os/realm.service';
import { authPreload } from 'os/services/auth/auth.service';
import { shipPreload } from 'os/services/ship/ship.service';
import { roomsPreload } from 'os/services/ship/rooms.service';
import { chatPreload } from 'os/services/ship/chat/chat.db';
import { notifPreload } from 'os/services/ship/notifications/notifications.service';
import { friendsPreload } from 'os/services/ship/friends/friends.table';
import { spacesPreload } from 'os/services/ship/spaces/spaces.service';
import { bazaarPreload } from 'os/services/ship/spaces/bazaar.service';

import { MultiplayerPreloadType } from 'main/preload.multiplayer';

declare global {
  interface Window {
    electron: {
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
    twttr: any;
  }
}

export {};
