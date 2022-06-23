import { NativeAppType } from '.';

export const devApps: {
  [key: string]: NativeAppType;
} = {
  'ballot-dev': {
    id: 'ballot-dev',
    title: 'Ballot - Dev',
    type: 'web',
    color: '#cebef0',
    icon: 'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg',
    web: {
      openFullscreen: true,
      url: 'http://localhost:3000/apps/ballot/',
      development: true,
    },
  },
  'playground-dev': {
    id: 'playground-dev',
    title: 'Playground - Dev',
    type: 'web',
    color: '#000000',
    icon: '',
    web: {
      openFullscreen: true,
      url: 'http://localhost:3010/apps/playground/',
      development: true,
    },
  },
};
