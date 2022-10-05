import { FC, createRef, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { Flex, IconButton, Icons } from 'renderer/components';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
// import { Roompps } from 'renderer/logic/Roomore';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { nativeApps } from 'renderer/apps';
import { AirliftInfo } from 'renderer/apps/Airlift/AirliftInfo';

type AirliftTrayProps = {};

const iconSize = 28;
export const AirliftTray: FC<AirliftTrayProps> = observer((props: AirliftTrayProps) => {
  const { theme, ship } = useServices();
  // TODO ship.cookie
  // ship
  //
  const {
    activeApp,
    roomsApp, // add an action for setProvider, setCookie
    setActiveApp,
    setTrayAppCoords,
    setTrayAppDimensions,
  } = useTrayApps();
  const { dockColor, textColor } = theme.currentTheme;
  const airliftButtonRef = createRef<HTMLButtonElement>();

  const dimensions = {
    height: 500,
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
        left: roomsApp.liveRoom ? left + 4 : left,
        bottom: roomsApp.liveRoom ? bottom - 2 : bottom,
      });
      setTrayAppDimensions(dimensions);
      // RoomsActions.requestAllRooms();
      setActiveApp('airlift-tray');
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  const onButtonDragStart = useCallback(
    (evt: any) => {
      evt.preventDefault();
      window.addEventListener('mouseup', onButtonDragEnd);
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  const onButtonDragEnd = useCallback(
    (evt: any) => {
      evt.preventDefault();
      window.removeEventListener('mouseup', onButtonDragEnd);
      DesktopActions.openAppWindow('', nativeApps['airlift']);
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
          size={iconSize}
          customBg={iconHoverColor}
          color={textColor}
          mt="2px"
          draggable={true}
          onDragStart={onButtonDragStart}
          // mb="-2px"
        >
          <Icons name="Airlift" pointerEvents="none" />
        </IconButton>
    </motion.div>
  );
});
