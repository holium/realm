import { RoomApp } from 'renderer/apps/Rooms';
import { SpacesTrayApp } from 'renderer/apps/Spaces';
import { AccountTrayApp } from 'renderer/apps/Account';
import { MessagesTrayApp } from 'renderer/apps/Messages';
import { WalletTrayApp } from 'renderer/apps/Wallet';
import { trayStore } from '../../../../apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

export type ViewRenderers = {
  [key: string]: {
    dimensions: {
      height: number;
      width: number;
      maxHeight?: number;
    };
    growHeight?: boolean;
    component: React.FC<any>;
    onOpen?: (evt: any) => void;
  };
};

const dimensions = {
  'account-tray': {
    width: 350,
    height: 238,
    maxHeight: 390,
  },
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
    dimensions: dimensions['account-tray'],
    growHeight: true,
    component: (props: any) => <AccountTrayApp {...props} />,
    onOpen: (evt: any) => {
      const position = 'top-left';
      const appDims = dimensions['account-tray'];
      const anchorOffset = { x: 8, y: 26 };
      const { setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
        trayStore;
      const { left, bottom }: any = calculateAnchorPoint(
        evt,
        anchorOffset,
        position,
        dimensions
      );
      setTrayAppCoords({
        left,
        bottom,
      });
      setTrayAppDimensions(appDims);
      setActiveApp('account-tray');
    },
  },
  'messages-tray': {
    dimensions: {
      width: 390,
      height: 600,
    },
    component: (props: any) => <MessagesTrayApp {...props} />,
    onOpen: (evt: any) => {
      const position = 'top-left';
      const appDims = dimensions['account-tray'];
      const anchorOffset = { x: 4, y: 26 };
      const { setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
        trayStore;
      const { left, bottom }: any = calculateAnchorPoint(
        evt,
        anchorOffset,
        position,
        dimensions
      );
      setTrayAppCoords({
        left,
        bottom,
      });
      setTrayAppDimensions(appDims);
      setActiveApp('messages-tray');
    },
  },
  'wallet-tray': {
    dimensions: {
      width: 330,
      height: 360,
    },
    component: (props: any) => <WalletTrayApp {...props} />,
  },
};
