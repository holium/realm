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

export const AppRegistry: Record<string, AppEntry> = {
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
      height: 670,
      width: 410,
    },
  },
};

type SystemEntry = {
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

export const SystemTrayRegistry: Record<string, SystemEntry> = {
  spaces: {
    position: 'top-right',
    anchorOffset: {
      x: 4,
      y: 16,
    },
    dimensions: { height: 550, width: 380 },
  },
};
