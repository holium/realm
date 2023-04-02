// Sets up the IPC interface for the renderer process
import { realmPreload } from 'os/index-new';
import { authPreload } from 'os/services-new/auth/auth.service';
import { shipPreload } from 'os/services-new/ship/ship.service';

export const AuthIPC: typeof authPreload = window.authService;
export const ShipIPC: typeof shipPreload = window.shipService;
export const RealmIPC: typeof realmPreload = window.realm;

AuthIPC.onUpdate((state: any) => {
  console.log('auth state updated', state);
});
