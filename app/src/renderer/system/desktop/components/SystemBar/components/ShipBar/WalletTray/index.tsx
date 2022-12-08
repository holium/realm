import { FC, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { observer } from 'mobx-react';

import { IconButton, Icons } from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

const position = 'top-left';
const anchorOffset = { x: 4, y: 26 };
const dimensions = { height: 620, width: 340 };

interface WalletTrayProps {
  theme: ThemeModelType;
}

export const WalletTray: FC<WalletTrayProps> = observer(
  ({ theme }: WalletTrayProps) => {
    const { dockColor, textColor } = theme;
    const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
      useTrayApps();

    const iconHoverColor = useMemo(
      () => rgba(darken(0.05, dockColor), 0.5),
      [dockColor]
    );

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
      <IconButton
        id="wallet-tray-icon"
        size={28}
        customBg={iconHoverColor}
        color={textColor}
        whileTap={{ scale: 0.95 }}
        transition={{ scale: 0.1 }}
        onClick={onButtonClick}
      >
        <Icons name="Wallet" pointerEvents="none" />
      </IconButton>
    );
  }
);
