import { FC } from 'react';

import { AccountTrayApp } from 'renderer/apps/Account';
import { CourierApp } from 'renderer/apps/Courier/app';
import { RoomApp } from 'renderer/apps/Rooms';
import { SpacesTrayApp } from 'renderer/apps/Spaces';
import { trayStore } from 'renderer/apps/store';
import { Wallet } from 'renderer/apps/Wallet/Wallet';
import { calculateAnchorPoint } from 'renderer/lib/position';

export type TrayAppKey =
  | 'rooms-tray'
  | 'spaces-tray'
  | 'account-tray'
  | 'messages-tray'
  | 'wallet-tray';

type TrayAppRenderers = Record<
  TrayAppKey,
  {
    dimensions: {
      height: number;
      width: number;
      maxHeight?: number;
    };
    growHeight?: boolean;
    component: FC<any>;
    onOpen?: (evt: any) => void;
  }
>;

export const defaultTrayDimensions: Record<
  TrayAppKey,
  {
    width: number;
    height: number;
    maxHeight?: number;
  }
> = {
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

export const trayAppRenderers: TrayAppRenderers = {
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
    component: () => <CourierApp />,
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
    component: () => <Wallet />,
    dimensions: defaultTrayDimensions['wallet-tray'],
  },
};
