/**
 * AuthActions for interfacing with core process
 */
import { authPreload } from 'os/services-new/auth/auth.service';
import { shipPreload } from 'os/services-new/ship/ship.service';

export const AuthIPC: typeof authPreload = window.authService;
export const ShipIPC: typeof shipPreload = window.shipService;
