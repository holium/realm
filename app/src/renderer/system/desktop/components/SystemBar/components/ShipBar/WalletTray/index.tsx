import { FC, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { observer } from 'mobx-react';

import { IconButton, Icons } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { useTrayApps } from 'renderer/logic/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

type WalletTrayProps = {
  theme: ThemeModelType;
};

const dimensions = {
  height: 360,
  width: 330,
};

const position = 'top-left';
const anchorOffset = { x: 4, y: 26 };

export const WalletTray: FC<WalletTrayProps> = observer(
  (props: WalletTrayProps) => {
    const { theme } = props;
    const { dockColor, textColor } = theme;
    const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
      useTrayApps();

    const iconHoverColor = useMemo(
      () => rgba(darken(0.05, theme.dockColor), 0.5),
      [theme.windowColor]
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
      [activeApp, anchorOffset, position, dimensions]
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
