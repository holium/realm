import { RoomApp } from 'renderer/apps/Rooms';
import { SpacesTrayApp } from 'renderer/apps/Spaces';
import { AccountTrayApp } from 'renderer/apps/Account';
import { MessagesTrayApp } from 'renderer/apps/Messages';
import { WalletTrayApp } from 'renderer/apps/Wallet';

export type ViewRenderers = {
  [key: string]: {
    dimensions: {
      height: number;
      width: number;
      maxHeight?: number;
    };
    growHeight?: boolean;
    component: React.FC<any>;
  };
};

export const trayAppRenderers: ViewRenderers = {
  'rooms-tray': {
    dimensions: {
      width: 380,
      height: 500,
    },
    component: (props: any) => <RoomApp {...props} />,
  },
  'spaces-tray': {
    dimensions: {
      width: 340,
      height: 500,
    },
    component: (props: any) => <SpacesTrayApp {...props} />,
  },
  'account-tray': {
    dimensions: {
      width: 350,
      height: 238,
      maxHeight: 390,
    },
    growHeight: true,
    component: (props: any) => <AccountTrayApp {...props} />,
  },
  'messages-tray': {
    dimensions: {
      width: 390,
      height: 600,
    },
    component: (props: any) => <MessagesTrayApp {...props} />,
  },
  'wallet-tray': {
    dimensions: {
      width: 330,
      height: 360,
    },
    component: (props: any) => <WalletTrayApp {...props} />,
  },
};
