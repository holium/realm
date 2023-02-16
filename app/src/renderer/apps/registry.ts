// import type { IconPathsType } from '@holium/design-system';
type AppEntry = {
  name: string;
  icon: any;
  iconSize: number;
  position: string;
  anchorOffset: {
    x: number;
    y: number;
  };
  dimensions: {
    height: number;
    width: number;
  };
};

export const AppRegistry: { [key: string]: AppEntry } = {
  chat: {
    name: 'Chat',
    icon: 'Messages',
    iconSize: 28,
    position: 'top-left',
    anchorOffset: {
      x: 4,
      y: 24,
    },
    dimensions: {
      height: 650,
      width: 400,
    },
  },
};
