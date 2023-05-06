export type ThemeProps = {
  id: string;
  backgroundColor: string;
  accentColor: string;
  inputColor: string;
  dockColor: string;
  windowColor: string;
  mode: string;
  textColor: string;
  iconColor: string;
  mouseColor: string;
  wallpaper: string;
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

export type SpaceKeys =
  | 'realm-forerunners'
  | 'minecrafters'
  | 'solarpunks'
  | 'retro-mac'
  | 'eth-underworld'
  | 'hacker-den';

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
