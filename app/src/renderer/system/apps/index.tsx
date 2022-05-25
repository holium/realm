import { WindowThemeType } from '../../logic/stores/config';

export type AppManifestType = {
  title: string;
  icon?: string;
  type: 'native' | 'web';
  native?: {
    hideTitlebar?: boolean;
    component: React.ReactNode;
  };
  web?: {
    url: string;
    theme: WindowThemeType;
  };
};

export const apps: AppManifestType[] = [
  {
    title: 'Browser',
    icon: '',
    type: 'native',
    native: {
      hideTitlebar: true,
      component: () => <div></div>,
    },
  },
  {
    title: 'System Preferences',
    icon: '',
    type: 'native',
    native: {
      component: () => <div></div>,
    },
  },
];
