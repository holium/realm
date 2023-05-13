import { ThemeSnapshotIn } from '@holium/shared';

export type SpaceKeys =
  | 'realm-forerunners'
  | 'cyberpunk'
  | 'holy-order'
  | 'spacebros'
  | 'amish'
  | 'athiest'
  | 'islam'
  | 'english'
  | 'mums'
  | 'flat-earth-society';

export type Space = {
  id: SpaceKeys;
  title: string;
  members: number;
  picture: string;
  theme: ThemeSnapshotIn & { id: SpaceKeys };
};

export type TrayAppType = {
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  id: TrayAppIDs;
};

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
