import { createRef, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { Badge, Flex, IconButton, Icons } from 'renderer/components';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { RoomRow } from 'renderer/apps/Rooms/components/RoomRow';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { useRooms } from 'renderer/apps/Rooms/useRooms';

const iconSize = 28;
const position = 'top-left';
const anchorOffset = { x: 8, y: 26 };
const dimensions = { height: 520, width: 380 };

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
  const roomsButtonRef = createRef<HTMLButtonElement>();
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

  const IconBadge = useMemo(
    () => (
      <Badge
        style={{ pointerEvents: 'none' }}
        right={-6}
        bottom={-4}
        wrapperWidth={iconSize + 6}
        wrapperHeight={iconSize + 3}
        textColor={'#FFFFFF'}
        background={rgba(theme.currentTheme.accentColor, 1)}
        count={presentRoom ? 0 : roomsManager.rooms.length}
      >
        <Icons
          mr="4px"
          size={iconSize}
          color={textColor}
          name="Connect"
          pointerEvents="none"
        />
      </Badge>
    ),
    [roomsManager.rooms.length, theme.currentTheme.accentColor, presentRoom]
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
              <IconButton
                size={iconSize}
                ref={roomsButtonRef}
                customBg={iconHoverColor}
                style={{ pointerEvents: 'none' }}
                color={textColor}
              >
                {IconBadge}
              </IconButton>
            }
          />
        </Flex>
      ) : (
        <Flex padding="2px">
          <IconButton
            id="rooms-tray-icon"
            ref={roomsButtonRef}
            size={iconSize}
            customBg={iconHoverColor}
            color={textColor}
          >
            {IconBadge}
          </IconButton>
        </Flex>
      )}
    </motion.div>
  );
});
