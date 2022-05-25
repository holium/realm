import { WindowThemeType } from '../../logic/stores/config';
import { SystemApp } from './System';

export type AppManifestType = {
  id: string;
  title: string;
  type: 'native' | 'web';
  color: string;
  icon?: string;
  native?: {
    hideTitlebar?: boolean;
    component: React.ReactNode;
  };
  web?: {
    url: string;
    theme: WindowThemeType;
  };
};

type AppManifestMap = {
  [key: string]: AppManifestType;
};

export const nativeApps: AppManifestMap = {
  // browser: {
  //   title: 'Browser',
  //   icon: {
  //     color: '',
  //     image: '',
  //   },
  //   type: 'native',
  //   native: {
  //     hideTitlebar: true,
  //     component: () => <div></div>,
  //   },
  // },
  'os-settings': {
    id: 'os-settings',
    title: 'Settings',
    color: '#ACBCCB',
    icon: 'AppIconSettings',
    type: 'native',
    native: {
      hideTitlebar: true,
      component: <SystemApp />,
    },
  },
};

export const NativeAppList = Object.values(nativeApps);

// id: types.identifier,
// title: types.string,
// type: types.optional(types.string, 'web'),
// icon: types.maybeNull(types.string),
// href: types.string,
