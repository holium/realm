import { patp2dec } from 'urbit-ob';
import { Patp } from '@urbit/http-api';

export function isFireFox(): boolean {
  if (!isWeb()) return false;
  return navigator.userAgent.includes('Firefox');
}

export function isSafari(): boolean {
  if (!isWeb()) return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  if (!isWeb()) return false;
  return /Tablet|iPad|Mobile|Android|BlackBerry/.test(navigator.userAgent);
}

export function isWeb(): boolean {
  return typeof document !== 'undefined';
}

export function isInitiator(localPatpId: number, remotePatp: Patp) {
  return localPatpId < patp2dec(remotePatp);
}

export function isWebRTCSignal(type: any): boolean {
  return !['ready', 'retry', 'ack-ready', 'waiting'].includes(type);
}
