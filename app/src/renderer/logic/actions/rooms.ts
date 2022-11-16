import { RoomsService } from 'os/services/tray/rooms.service';

/**
 * RoomsActions for interfacing with core process
 */
type RoomsActionType = typeof RoomsService.preload;
export const RoomsActions: RoomsActionType = window.electron.os.tray.rooms;
