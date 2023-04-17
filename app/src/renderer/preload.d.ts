import { AppPreloadType } from 'main/preload';
import { authPreload } from 'os/services-new/auth/auth.service';
import { shipPreload } from 'os/services-new/ship/ship.service';
import { roomsPreload } from 'os/services-new/ship/rooms.service';
import { realmPreload } from 'os/realm.service';
import { chatPreload } from 'os/services-new/ship/chat.service';
import { notifPreload } from 'os/services-new/ship/notifications.service';
import { friendsPreload } from 'os/services-new/ship/models/friends.model';
import { spacesPreload } from 'os/services-new/ship/spaces.service';
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
