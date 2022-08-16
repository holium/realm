import { RoomApp } from 'renderer/apps/Rooms';
import { SpacesTrayApp } from 'renderer/apps/Spaces';
import { AccountTrayApp } from 'renderer/apps/Account';
import { MessagesTrayApp } from 'renderer/apps/Messages';
import { WalletApp } from 'renderer/apps/Wallet';

export type ViewRenderers = {
  [key: string]: {
    component: React.FC<any>;
  };
};

export const trayAppRenderers: ViewRenderers = {
  'rooms-tray': {
    component: (props: any) => <RoomApp {...props} />,
  },
  'spaces-tray': {
    component: (props: any) => <SpacesTrayApp {...props} />,
  },
  'account-tray': {
    component: (props: any) => <AccountTrayApp {...props} />,
  },
  'messages-tray': {
    component: (props: any) => <MessagesTrayApp {...props} />,
  },
  'wallet-tray': {
    component: (props: any) => <WalletApp {...props} />,
  },
};
