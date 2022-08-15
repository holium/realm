import { SpacesService } from 'os/services/spaces/spaces.service';

/**
 * SpacesActions for interfacing with core process
 */
type SpacesActionType = typeof SpacesService.preload;
export const SpacesActions: SpacesActionType = window.electron.os.spaces;
