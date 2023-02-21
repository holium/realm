import { createRef, FC, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { Icon } from '@holium/design-system';
import { motion } from 'framer-motion';

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

  const iconHoverColor = useMemo(
    () => rgba(darken(0.05, theme.currentTheme.dockColor), 0.5),
    [theme.currentTheme.windowColor]
  );

  return (
    <motion.div
      id="airlift-tray-icon"
      className="realm-cursor-hover"
      style={{
        position: 'relative',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ scale: 0.2 }}
      onClick={onButtonClick}
    >
      <Icon name="Airlift" size={ICON_SIZE} pointerEvents="none" opacity={1} />
    </motion.div>
  );
});
