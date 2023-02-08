import { RoomApp } from 'renderer/apps/Rooms';
import { SpacesTrayApp } from 'renderer/apps/Spaces';
import { AccountTrayApp } from 'renderer/apps/Account';
import { MessagesTrayApp } from 'renderer/apps/Messages';
import { WalletApp } from 'renderer/apps/Wallet';
import { trayStore } from '../../../../apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { CourierRoot } from 'renderer/apps/Courier';

export interface ViewRenderers {
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
}

export const defaultTrayDimensions = {
  'rooms-tray': {
    width: 380,
    height: 500,
  },
  'spaces-tray': {
    width: 340,
    height: 500,
  },
  'account-tray': {
    width: 350,
    height: 238,
    maxHeight: 390,
  },
  'messages-tray': {
    width: 390,
    height: 600,
  },
  'wallet-tray': {
    width: 330,
    height: 600,
  },
};

export const trayAppRenderers: ViewRenderers = {
  'rooms-tray': {
    dimensions: defaultTrayDimensions['rooms-tray'],
    component: () => <RoomApp />,
  },
  'spaces-tray': {
    dimensions: defaultTrayDimensions['spaces-tray'],
    component: () => <SpacesTrayApp />,
  },
  'account-tray': {
    dimensions: defaultTrayDimensions['account-tray'],
    growHeight: true,
    component: () => <AccountTrayApp />,
    onOpen: (evt: any) => {
      const position = 'top-left';
      const appDims = defaultTrayDimensions['account-tray'];
      const anchorOffset = { x: 8, y: 26 };
      const { setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
        trayStore;
      const { left, bottom }: any = calculateAnchorPoint(
        evt,
        anchorOffset,
        position,
        defaultTrayDimensions
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
    dimensions: defaultTrayDimensions['messages-tray'],
    component: () => <CourierRoot />,
    onOpen: (evt: any) => {
      const position = 'top-left';
      const appDims = defaultTrayDimensions['messages-tray'];
      const anchorOffset = { x: 4, y: 26 };
      const { setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
        trayStore;
      const { left, bottom }: any = calculateAnchorPoint(
        evt,
        anchorOffset,
        position,
        defaultTrayDimensions
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
    component: () => <WalletApp />,
    dimensions: defaultTrayDimensions['wallet-tray'],
  },
};
