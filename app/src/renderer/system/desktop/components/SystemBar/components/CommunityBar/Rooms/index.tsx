import { FC, createRef, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { Flex, IconButton, Icons } from 'renderer/components';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
// import { Roompps } from 'renderer/logic/Roomore';
import { RoomRow } from 'renderer/apps/Rooms/components/RoomRow';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { useTrayApps } from 'renderer/apps/store';
type RoomTrayProps = {};

const iconSize = 28;
export const RoomTray: FC<RoomTrayProps> = observer((props: RoomTrayProps) => {
  const { desktop, ship } = useServices();
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
  const { dockColor, textColor } = desktop.theme;
  const roomsButtonRef = createRef<HTMLButtonElement>();

  const dimensions = {
    height: 500,
    width: 380,
  };

  const position = 'top-left';
  const anchorOffset = { x: 8, y: 26 };

  const onButtonClick = useCallback(
    (evt: any) => {
      if (activeApp === 'rooms-tray') {
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
      setActiveApp('rooms-tray');
      if (roomsApp.liveRoom) {
        RoomsActions.setView('room');
      }
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  const iconHoverColor = useMemo(
    () => rgba(darken(0.05, desktop.theme.dockColor), 0.5),
    [desktop.theme.windowColor]
  );

  return (
    <motion.div
      id="rooms-tray-icon"
      className="realm-cursor-hover"
      // @ts-expect-error -
      ref={roomsButtonRef}
      whileTap={{ scale: 0.975 }}
      transRoom={{ scale: 0.2 }}
      position="relative"
      onClick={onButtonClick}
    >
      {roomsApp.liveRoom ? (
        <Flex style={{ pointerEvents: 'none' }}>
          <RoomRow
            tray={true}
            {...roomsApp.liveRoom}
            rightChildren={
              <Icons
                // mb="2px"
                size={iconSize - 4}
                color={textColor}
                name="Connect"
                pointerEvents="none"
              />
            }
          />
        </Flex>
      ) : (
        <IconButton
          id="rooms-tray-icon"
          ref={roomsButtonRef}
          size={iconSize}
          customBg={iconHoverColor}
          color={textColor}
          mt="2px"
          // mb="-2px"
        >
          <Icons name="Connect" pointerEvents="none" />
        </IconButton>
      )}
    </motion.div>
  );
});
