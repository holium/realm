/**
 * AuthActions for interfacing with core process
 */
import { AuthService } from 'os/services/identity/auth.service';

type AuthActionType = typeof AuthService.preload;
export const AuthActions: AuthActionType = window.electron.os.auth;
