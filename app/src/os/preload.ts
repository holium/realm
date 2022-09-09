import { Realm } from './';
import { AuthService } from './services/identity/auth.service';
import { OnboardingService } from './services/onboarding/onboarding.service';
import { DesktopService } from './services/shell/desktop.service';
import { ShellService } from './services/shell/shell.service';
import { ShipService } from './services/ship/ship.service';
import { SlipService } from './services/slip.service';
import { SpacesService } from './services/spaces/spaces.service';
import { RoomsService } from './services/tray/rooms.service';

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
  },
  slip: SlipService.preload,
};

export type OSPreloadType = typeof osPreload;
