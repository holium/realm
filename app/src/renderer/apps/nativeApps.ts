import { ThemeModelType } from 'os/services/theme.model';

type NativeAppType = {
  id: string;
  title: string;
  type: 'native' | 'web' | 'urbit';
  color: string;
  icon?: string;
  native?: {
    hideTitlebarBorder?: boolean;
    noTitlebar?: boolean;
    openFullscreen?: boolean;
  };
  web?: {
    url: string;
    dimensions?: {
      width: number;
      height: number;
    };
    openFullscreen?: boolean;
    theme?: ThemeModelType;
    development?: boolean;
  };
};

type AppManifestMap = Record<string, NativeAppType>;

const devApps: AppManifestMap = {
  'ballot-dev': {
    id: 'ballot-dev',
    title: 'Ballot - Dev',
    type: 'web',
    color: '#cebef0',
    icon: 'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg',
    web: {
      openFullscreen: true,
      url: 'http://localhost:3001/apps/ballot/',
      development: true,
    },
  },
};

export const nativeApps: AppManifestMap = {
  'os-browser': {
    id: 'os-browser',
    title: 'Relic Browser',
    color: '#92D4F9',
    icon: 'AppIconCompass',
    type: 'native',
    native: {
      hideTitlebarBorder: false,
      noTitlebar: true,
      openFullscreen: true,
    },
  },
  'os-settings': {
    id: 'os-settings',
    title: 'Settings',
    color: '#ACBCCB',
    icon: 'AppIconSettings',
    type: 'native',
    native: {
      hideTitlebarBorder: true,
    },
  },
  'os-campfire': {
    id: 'os-campfire',
    title: 'Campfire',
    color: '#F9D492',
    icon: 'AppIconCampfire',
    type: 'native',
    native: {
      hideTitlebarBorder: true,
    },
  },
  ...devApps,
};
