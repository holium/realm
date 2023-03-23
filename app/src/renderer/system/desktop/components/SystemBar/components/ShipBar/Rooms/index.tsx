import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { roomTrayConfig } from 'renderer/apps/Rooms/config';
import { RoomsDock, Box } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { RealmProtocol } from '@holium/realm-room';
import { RealmActions } from 'renderer/logic/actions/main';

const RoomTrayPresenter = () => {
  const { ship, friends, spaces, desktop } = useServices();
  const { position, anchorOffset, dimensions } = roomTrayConfig;

  useEffect(() => {
    RealmActions.getMediaStatus().then((status) => {
      if (status.mic === 'denied') desktop.setMicAllowed(false);
      else desktop.setMicAllowed(true);
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

  const rooms = spaces.selected
    ? (roomsManager?.protocol as RealmProtocol).getSpaceRooms(
        spaces.selected?.path
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
        hasMicPermissions={desktop.micAllowed}
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
