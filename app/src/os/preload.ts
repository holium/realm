import { Realm } from './index';
import { CampfireService } from './services/apps/campfire.service';
import { AuthService } from './services/identity/auth.service';
import { OnboardingService } from './services/onboarding/onboarding.service';
import { DesktopService } from './services/shell/desktop.service';
import { ShellService } from './services/shell/shell.service';
import { ShipService } from './services/ship/ship.service';
import { SlipService } from './services/slip.service';
import { SpacesService } from './services/spaces/spaces.service';
import { RoomsService } from './services/tray/rooms.service';
import { WalletService } from './services/tray/wallet.service';

export const osPreload = {
  ...Realm.preload,
  auth: AuthService.preload,
  ship: ShipService.preload,
  spaces: SpacesService.preload,
  desktop: DesktopService.preload,
  shell: ShellService.preload,
  onboarding: OnboardingService.preload,
  tray: {
    rooms: RoomsService.preload,
    wallet: WalletService.preload,
  },
  slip: SlipService.preload,
  campfire: CampfireService.preload,
};

export type OSPreloadType = typeof osPreload;
