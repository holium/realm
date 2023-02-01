import { FC, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { BarButton, Icon } from '@holium/design-system';

const position = 'top-left';
const anchorOffset = { x: 4, y: 26 };
const dimensions = { height: 620, width: 340 };

export const WalletTrayPresenter: FC = () => {
  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const onButtonClick = useCallback(
    (evt: any) => {
      if (activeApp === 'wallet-tray') {
        setActiveApp(null);
        evt.stopPropagation();
        return;
      }
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
      setTrayAppDimensions(dimensions);
      setActiveApp('wallet-tray');
    },
    [activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions]
  );

  return (
    <BarButton
      id="wallet-tray-icon"
      height={28}
      width={28}
      whileTap={{ scale: 0.95 }}
      transition={{ scale: 0.1 }}
      onClick={onButtonClick}
    >
      <Icon name="WalletTray" size={24} pointerEvents="none" />
    </BarButton>
  );
};

export const WalletTray = observer(WalletTrayPresenter);
