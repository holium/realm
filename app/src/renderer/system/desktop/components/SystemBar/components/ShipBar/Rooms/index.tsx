import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';

import { Box, RoomsDock } from '@holium/design-system';

import { roomTrayConfig } from 'renderer/apps/Rooms/config';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/lib/position';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

const RoomTrayPresenter = () => {
  const { shellStore } = useAppState();
  const { friends, spacesStore } = useShipStore();
  const roomsStore = useRoomsStore();

  const { position, anchorOffset, dimensions } = roomTrayConfig;

  useEffect(() => {
    MainIPC.getMediaStatus().then((status) => {
      if (status.mic === 'denied') shellStore.setMicAllowed(false);
      else shellStore.setMicAllowed(true);
    });
  }, []);

  const {
    activeApp,
    roomsApp, // add an action for setProvider, setCookie
    setActiveApp,
    setTrayAppCoords,
    setTrayAppDimensions,
  } = useTrayApps();

  const muted = roomsStore.isMuted;

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
        left,
        bottom,
      });
      setTrayAppDimensions(dimensions);
      setActiveApp('rooms-tray');
    },
    [
      activeApp,
      roomsApp.liveRoom,
      setActiveApp,
      setTrayAppCoords,
      setTrayAppDimensions,
    ]
  );

  const participants =
    roomsStore.currentRoomPresent.map((patp: string) => {
      const metadata = friends.getContactAvatarMetadata(patp);
      return metadata;
    }) || [];

  const rooms = spacesStore.selected
    ? roomsStore.getSpaceRooms(spacesStore.selected?.path)
    : [];

  return (
    <Box
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
    >
      <RoomsDock
        live={roomsStore.currentRoom}
        rooms={rooms}
        participants={participants}
        onCreate={() => {
          console.log('create room');
        }}
        isMuted={muted}
        hasMicPermissions={shellStore.micAllowed}
        onOpen={onButtonClick}
        onMute={() => {
          if (muted) {
            roomsStore.ourPeer.unmute();
          } else {
            roomsStore.ourPeer.mute();
          }
        }}
        onCursor={() => {}}
        onLeave={() => {}}
      />
    </Box>
  );
};

export const RoomTray = observer(RoomTrayPresenter);
