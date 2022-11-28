import { FC, useState, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
  Grid,
  Flex,
  Icons,
  Text,
  TextButton,
  InnerNotification,
  Tooltip,
  IconButton,
  Spinner,
} from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { RoomRow } from './components/RoomRow';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useServices } from 'renderer/logic/store';
import { LiveRoom, useTrayApps } from 'renderer/apps/store';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { RoomsModelType } from 'os/services/tray/rooms.model';
import { ProviderSelector } from './components/ProviderSelector';
export interface RoomListProps {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
}
export const Rooms: FC<RoomListProps> = observer((props: RoomListProps) => {
  const { dimensions } = props;
  const { ship, theme } = useServices();
  const { windowColor } = theme.currentTheme;
  const [muted, setMuted] = useState(false);
  const { roomsApp } = useTrayApps();
  // const knownRoomsMap = roomsApp.knownRooms;
  const knownRooms = roomsApp.list;
  const inviteColor = '#F08735';
  const amHosting =
    knownRooms.findIndex((a: any) => a.host === ship?.patp) !== -1;

  useEffect(() => {
    RoomsActions.requestAllRooms();
    RoomsActions.getProvider();
  }, []);

  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
      expand
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        hasBorder={false}
        zIndex={5}
        theme={{
          ...props.theme,
          windowColor,
        }}
      >
        <Flex pl={3} pr={4} mr={3} justifyContent="center" alignItems="center">
          <Icons opacity={0.8} name="Connect" size={26} mr={2} />
          <Text
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Rooms
          </Text>
          {roomsApp.isLoadingList && <Spinner pl={2} size={0} />}
        </Flex>
        <Flex ml={1} pl={2} pr={2}>
          <TextButton
            disabled={amHosting}
            onClick={(evt: any) => {
              evt.stopPropagation();
              RoomsActions.setView('new-room');
            }}
          >
            Create
          </TextButton>
        </Flex>
      </Titlebar>
      <Flex
        style={{ marginTop: 54, maxHeight: '100%' }}
        gap={8}
        flex={1}
        flexDirection="column"
        overflowY={'scroll'}
      >
        {knownRooms.length === 0 && (
          <Flex
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mb={46}
          >
            <Text fontWeight={500} mb={2} opacity={0.5}>
              No rooms
            </Text>
            <Text width="90%" textAlign="center" opacity={0.3}>
              A room enables collaboration with other people.
            </Text>
          </Flex>
        )}
        {knownRooms.map((room: RoomsModelType, index: number) => {
          return (
            <RoomRow
              key={`${room.title}-${index}`}
              id={room.id}
              title={room.title}
              provider={room.provider}
              present={room.present}
              cursors={room.cursors}
              creator={room.creator}
              access={room.access}
              capacity={room.capacity}
              onClick={async (evt: any) => {
                evt.stopPropagation();
                if (!roomsApp.isRoomValid(room.id)) {
                  console.log('invalid room!');
                  // TODO this check doesnt catch bad state
                } else if (roomsApp.isLiveRoom(room.id)) {
                  RoomsActions.setView('room');
                } else if (room.present.includes(ship!.patp)) {
                  RoomsActions.setLiveRoom(toJS(room));
                  RoomsActions.setView('room');
                } else {
                  if (
                    // our old room was created by us
                    roomsApp.liveRoom! &&
                    roomsApp.isCreator(ship!.patp, roomsApp.liveRoom.id)
                  ) {
                    // conditionally delete old room
                    RoomsActions.deleteRoom(roomsApp.liveRoom.id);
                  }
                  await RoomsActions.joinRoom(room.id);
                  RoomsActions.setView('room');
                  await RoomsActions.requestAllRooms();
                }
              }}
            />
          );
        })}
      </Flex>
      {roomsApp.invitesList.map((value: any) => (
        <Flex key={value.id} flexDirection="column" width="100%">
          <InnerNotification
            id={value.id}
            title={value.title}
            seedColor={theme.currentTheme.textColor}
            subtitle={`Sent by: ${value.invitedBy}`}
            actionText="Accept"
            onAction={(id: string) => {
              console.log('accepting invite', id);
              RoomsActions.acceptInvite(value.id);
            }}
            onDismiss={(id: string) => {
              console.log('removing invite', id);
              RoomsActions.dismissInvite(value.id);
            }}
          />
        </Flex>
      ))}
      <Flex mt={3} pb={4} justifyContent="flex-start">
        {roomsApp.provider !== ship!.patp && (
          <IconButton
            // Temporary way to get back to your provider
            mr={2}
            onClick={() => {
              if (roomsApp.liveRoom) {
                RoomsActions.leaveRoom(roomsApp.liveRoom.id);
              }
              LiveRoom.leave();
              RoomsActions.setProvider(ship!.patp);
            }}
          >
            <Icons opacity={0.8} name="ProfileImage" size={26} mx={2} />
          </IconButton>
        )}
        <IconButton
          mr={2}
          onClick={() => {
            RoomsActions.requestAllRooms();
            RoomsActions.refreshLocalRoom();
            // RoomsActions.getProvider();
          }}
        >
          <Icons opacity={0.8} name="Refresh" size={26} mx={2} />
        </IconButton>
        <Tooltip
          id="room-provider"
          placement="top"
          content="This is your room provider."
        >
          <ProviderSelector
            seedColor={windowColor}
            onClick={() => {
              console.log('show provider setup');
            }}
          />
        </Tooltip>
      </Flex>
    </Grid.Column>
  );
});
