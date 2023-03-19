import { CampfireService } from 'os/services/apps/campfire.service';

/**
 * CampfireActions for interfacing with core process
 */
type CampfireActionType = typeof CampfireService.preload;
export const CampfireActions: CampfireActionType = window.electron.os.campfire;
