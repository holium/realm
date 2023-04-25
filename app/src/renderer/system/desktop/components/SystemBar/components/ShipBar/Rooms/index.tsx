import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { calculateAnchorPoint } from 'renderer/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { roomTrayConfig } from 'renderer/apps/Rooms/config';
import { RoomsDock, Box } from '@holium/design-system';
import { RealmProtocol } from '@holium/realm-room';
import { MainIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';
import { useAppState } from 'renderer/stores/app.store';

const RoomTrayPresenter = () => {
  const { shellStore } = useAppState();
  const { ship, friends, spacesStore } = useShipStore();
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

  const roomsManager = useRooms(ship?.patp);
  const muted = roomsManager.protocol.local?.isMuted;

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
    roomsManager?.presentRoom?.present.map((patp: string) => {
      const metadata = friends.getContactAvatarMetadata(patp);
      return metadata;
    }) || [];

  const rooms = spacesStore.selected
    ? (roomsManager?.protocol as RealmProtocol).getSpaceRooms(
        spacesStore.selected?.path
      )
    : [];

  return (
    <Box
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
    >
      <RoomsDock
        live={roomsManager?.live.room}
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
            roomsManager?.unmute();
          } else {
            roomsManager?.mute();
          }
        }}
        onCursor={() => {}}
        onLeave={() => {}}
      />
    </Box>
  );
};

export const RoomTray = observer(RoomTrayPresenter);
