import { spaces } from './spaces';
export type TrayAppType = {
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  id: TrayAppIDs;
};

export type SpaceKeys = keyof typeof spaces;

export type TrayAppIDs =
  | 'spaces'
  | 'rooms-tray'
  | 'wallet'
  | 'chat'
  | 'notifications'
  | null;

export type Views =
  | 'hero'
  | 'spaces'
  | 'wallet'
  | 'chat'
  | 'notifications'
  | 'rooms-tray'
  | null;
