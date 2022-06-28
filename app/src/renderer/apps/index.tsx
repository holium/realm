const isDev = true;
import { devApps } from './development';
import { ThemeModelType } from 'os/services/shell/theme.model';

export type NativeAppType = {
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
    openFullscreen?: boolean;
    theme?: ThemeModelType;
    development?: boolean;
  };
};

type AppManifestMap = {
  [key: string]: NativeAppType;
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
  ...{ ...(isDev ? devApps : {}) },
};

export const NativeAppList = Object.values(nativeApps);

// id: types.identifier,
// title: types.string,
// type: types.optional(types.string, 'web'),
// icon: types.maybeNull(types.string),
// href: types.string,
