import { useCallback } from 'react';
import { observer } from 'mobx-react';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { roomTrayConfig } from 'renderer/apps/Rooms/config';
import { RoomsDock } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { RealmProtocol } from '@holium/realm-room';

const RoomTrayPresenter = () => {
  const { ship, contacts, spaces } = useServices();
  const { position, anchorOffset, dimensions } = roomTrayConfig;

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
      const metadata = contacts.getContactAvatarMetadata(patp);
      return metadata;
    }) || [];

  const rooms = spaces.selected
    ? (roomsManager?.protocol as RealmProtocol).getSpaceRooms(
        spaces.selected?.path
      )
    : [];

  return (
    <RoomsDock
      live={roomsManager?.live.room}
      rooms={rooms}
      participants={participants}
      onCreate={() => {
        console.log('create room');
      }}
      isMuted={muted}
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
  );
  // return (

  //   <motion.div
  //     id="rooms-tray-icon"
  //     className="realm-cursor-hover"
  //     whileTap={{ scale: 0.975 }}
  //     onClick={onButtonClick}
  //   >
  //     {presentRoom ? (
  //       <Flex style={{ pointerEvents: 'none' }}>
  //         <RoomRow
  //           tray={true}
  //           rid={presentRoom.rid}
  //           title={presentRoom.title}
  //           present={presentRoom.present}
  //           creator={presentRoom.creator}
  //           provider={presentRoom.provider}
  //           rightChildren={
  //             <IconButton
  //               size={iconSize}
  //               ref={roomsButtonRef}
  //               customBg={iconHoverColor}
  //               style={{ pointerEvents: 'none' }}
  //               color={textColor}
  //             >
  //               {IconBadge}
  //             </IconButton>
  //           }
  //         />
  //       </Flex>
  //     ) : (
  //       <Flex padding="2px">
  //         <IconButton
  //           id="rooms-tray-icon"
  //           ref={roomsButtonRef}
  //           size={iconSize}
  //           customBg={iconHoverColor}
  //           color={textColor}
  //         >
  //           {IconBadge}
  //         </IconButton>
  //       </Flex>
  //     )}
  //   </motion.div>
  // );
};

export const RoomTray = observer(RoomTrayPresenter);
