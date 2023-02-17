import { FC, createRef, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { nativeApps } from 'renderer/apps/nativeApps';
import { AppType } from 'os/services/spaces/models/bazaar';
import { Icon } from '@holium/design-system';
import { IconButton } from 'renderer/components';

const ICON_SIZE = 28;

export const AirliftTray: FC = observer(() => {
  const { theme, ship } = useServices();
  // TODO ship.cookie
  // ship
  //
  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();
  const { textColor } = theme.currentTheme;
  const airliftButtonRef = createRef<HTMLButtonElement>();

  const dimensions = {
    height: 180,
    width: 380,
  };

  const position = 'top-left';
  const anchorOffset = { x: 8, y: 26 };

  const onButtonClick = useCallback(
    (evt: any) => {
      if (activeApp === 'airlift-tray') {
        setActiveApp(null);
        evt.stopPropagation();
        return;
      }
      // ------------------------------------------------
      // ------------------------------------------------
      const { left, bottom }: any = calculateAnchorPoint(
        evt,
        anchorOffset,
        position,
        dimensions
      );
      // TODO hacky fix for positioning issue with larger button
      setTrayAppCoords({
        left,
        bottom,
      });
      setTrayAppDimensions(dimensions);
      setActiveApp('airlift-tray');
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  const onButtonDragStart = useCallback(
    (evt: any) => {
      evt.preventDefault();
      window.addEventListener('mouseup', onButtonDragEnd);
      const iconEvent = new CustomEvent('icon', {
        detail: 'Airlift',
      });
      window.dispatchEvent(iconEvent);
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  const onButtonDragEnd = useCallback(
    (evt: any) => {
      evt.preventDefault();
      const iconEvent = new CustomEvent('icon', {
        detail: null,
      });
      window.dispatchEvent(iconEvent);
      window.removeEventListener('mouseup', onButtonDragEnd);
      DesktopActions.openAppWindow(nativeApps['airlift'] as AppType);
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  const iconHoverColor = useMemo(
    () => rgba(darken(0.05, theme.currentTheme.dockColor), 0.5),
    [theme.currentTheme.windowColor]
  );

  return (
    <motion.div
      id="airlift-tray-icon"
      className="realm-cursor-hover"
      // @ts-expect-error -
      ref={airliftButtonRef}
      whileTap={{ scale: 0.975 }}
      transRoom={{ scale: 0.2 }}
      position="relative"
      onClick={onButtonClick}
    >
      <IconButton
        id="airlift-tray-icon"
        ref={airliftButtonRef}
        size={ICON_SIZE}
        customBg={iconHoverColor}
        color={textColor}
        mt="2px"
        // draggable={true}
        // onDragStart={onButtonDragStart}
        // mb="-2px"
      >
        <Icon name="Airlift" size={ICON_SIZE} pointerEvents="none" />
      </IconButton>
    </motion.div>
  );
});
