import { AppPreloadType } from 'main/preload';
import { authPreload } from 'os/services/auth/auth.service';
import { onboardingPreload } from 'os/services/auth/onboarding.service';
import { shipPreload } from 'os/services/ship/ship.service';
import { roomsPreload } from 'os/services/ship/rooms.service';
import { realmPreload } from 'os/realm.service';
import { chatPreload } from 'os/services/ship/chat/chat.service';
import { notifPreload } from 'os/services/ship/notifications/notifications.service';
import { friendsPreload } from 'os/services/ship/friends.service';
import {
  bazaarPreload,
  bazaarPreload,
} from 'os/services/ship/spaces/bazaar.service';
import { spacesPreload } from 'os/services/ship/spaces/spaces.service';
import { walletPreload } from 'os/services/ship/wallet/wallet.service';

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
    onboardingService: typeof onboardingPreload;
    roomsService: typeof roomsPreload;
    chatService: typeof chatPreload;
    walletService: typeof walletPreload;
    notifService: typeof notifPreload;
    friendDb: typeof friendsPreload;
    realm: typeof realmPreload;
    spacesService: typeof spacesPreload;
    bazaarService: typeof bazaarPreload;
    twttr: any;
  }
}

export {};
