import { AppPreloadType } from 'main/preload';
import { MultiplayerPreloadType } from 'main/preload.multiplayer';
import { realmPreload } from 'os/realm.service';
import { authPreload } from 'os/services/auth/auth.service';
import { onboardingPreload } from 'os/services/auth/onboarding.service';
import { migrationPreload } from 'os/services/migration/migration.service';
import { chatPreload } from 'os/services/ship/chat/chat.service';
import { friendsPreload } from 'os/services/ship/friends.service';
import { notifPreload } from 'os/services/ship/notifications/notifications.service';
import { settingsPreload } from 'os/services/ship/settings.service';
import { shipPreload } from 'os/services/ship/ship.service';
import { bazaarPreload } from 'os/services/ship/spaces/bazaar.service';
import { spacesPreload } from 'os/services/ship/spaces/spaces.service';
import { appPublishersDBPreload } from 'os/services/ship/spaces/tables/appPublishers.table';
import { appRecentsPreload } from 'os/services/ship/spaces/tables/appRecents.table';
import { walletPreload } from 'os/services/ship/wallet/wallet.service';

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
    migrationService: typeof migrationPreload;
    onboardingService: typeof onboardingPreload;
    chatService: typeof chatPreload;
    walletService: typeof walletPreload;
    notifService: typeof notifPreload;
    friendDb: typeof friendsPreload;
    realm: typeof realmPreload;
    spacesService: typeof spacesPreload;
    bazaarService: typeof bazaarPreload;
    appInstallService: typeof appPublishersDBPreload;
    appRecentsService: typeof appRecentsPreload;
    settingsService: typeof settingsPreload;
    twttr: any;
  }
}

export {};
