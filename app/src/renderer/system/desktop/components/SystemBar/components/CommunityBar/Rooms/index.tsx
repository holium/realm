import { useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { Flex, IconButton, Icons } from 'renderer/components';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { RoomRow } from 'renderer/apps/Rooms/components/RoomRow';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { useRooms } from 'renderer/apps/Rooms/useRooms';

const iconSize = 28;
const position = 'top-left';
const anchorOffset = { x: 8, y: 26 };
const dimensions = { height: 500, width: 380 };

export const RoomTray = observer(() => {
  const { theme } = useServices();
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
  const { textColor } = theme.currentTheme;
  const roomsManager = useRooms();

  const presentRoom = useMemo(() => {
    if (!roomsManager) return;
    if (!roomsManager.presentRoom) return;
    return roomsManager.presentRoom.room;
  }, [roomsManager?.presentRoom?.room]);

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
        // RoomsActions.setView('room');
      }
    },
    [
      activeApp,
      roomsApp.liveRoom,
      setActiveApp,
      setTrayAppCoords,
      setTrayAppDimensions,
    ]
  );

  const iconHoverColor = useMemo(
    () => rgba(darken(0.05, theme.currentTheme.dockColor), 0.5),
    [theme.currentTheme.dockColor]
  );

  return (
    <motion.div
      id="rooms-tray-icon"
      className="realm-cursor-hover"
      whileTap={{ scale: 0.975 }}
      onClick={onButtonClick}
    >
      {presentRoom ? (
        <Flex style={{ pointerEvents: 'none' }}>
          <RoomRow
            tray={true}
            rid={presentRoom.rid}
            title={presentRoom.title}
            present={presentRoom.present}
            creator={presentRoom.creator}
            provider={presentRoom.provider}
            rightChildren={
              <Icons
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
          size={iconSize}
          customBg={iconHoverColor}
          color={textColor}
          mt="2px"
        >
          <Icons name="Connect" pointerEvents="none" />
        </IconButton>
      )}
    </motion.div>
  );
});
