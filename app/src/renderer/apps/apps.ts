type AppType = {
  id: string;
  title: string;
  type: 'native' | 'web' | 'urbit' | 'dev';
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
    development?: boolean;
  };
};

type AppManifestMap = Record<string, AppType>;

export const devApps: AppManifestMap = {
  gdelt: {
    id: 'gdelt',
    title: 'GDELT',
    type: 'dev',
    color: '#00ccff',
    icon: 'AppIconCompass',
    web: {
      openFullscreen: true,
      url: 'https://gdelt.github.io/',
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
};
