import { ShipService } from 'os/services/ship/ship.service';

/**
 * SpacesActions for interfacing with core process
 */
type ShipActionType = typeof ShipService.preload;
export const ShipActions: ShipActionType = window.electron.os.ship;
