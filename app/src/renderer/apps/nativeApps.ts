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
  'os-lexicon': {
    id: 'os-lexicon',
    title: 'Lexicon',
    type: 'native',
    color: '#EEDFC9',
    icon: 'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/lexicon.svg',
    native: {
      hideTitlebarBorder: true,
    },
  },
  'os-notes': {
    id: 'os-notes',
    title: 'Notes',
    color: '#F9D9F9',
    icon: 'AppIconNotes',
    type: 'native',
    native: {
      hideTitlebarBorder: true,
    },
  },
  'os-trove': {
    id: 'os-trove',
    title: 'Trove',
    type: 'native',
    color: '#DCDCDC',
    icon: 'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/trove.svg',
    native: {
      hideTitlebarBorder: true,
    },
  },
  ...devApps,
};
