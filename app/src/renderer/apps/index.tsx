import { WindowThemeType } from 'renderer/logic/stores/config';
import { SystemApp } from './System';
import { Browser, BrowserProps } from './Browser';
import { BrowserToolbar, BrowserToolbarProps } from './Browser/Toolbar';
const isDev = true;
import { devApps } from './development';

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
    titlebar?: React.FC<any>;
    component: React.FC<any>;
  };
  web?: {
    url: string;
    openFullscreen?: boolean;
    theme?: WindowThemeType;
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
      titlebar: (props: BrowserToolbarProps) => <BrowserToolbar {...props} />,
      component: (props: BrowserProps) => <Browser {...props} />,
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
      component: (props: any) => <SystemApp {...props} />,
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
