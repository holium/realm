import { useState } from 'react';
import { observer } from 'mobx-react';
import {
  Grid,
  Flex,
  Text,
  TextButton,
  Icons,
  Tooltip,
  IconButton,
} from 'renderer/components';
import { RoomRow } from './components/RoomRow';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useServices } from 'renderer/logic/store';
import { ProviderSelector } from './components/ProviderSelector';
import { useRooms } from './useRooms';
import { useTrayApps } from '../store';
import { RealmProtocol, RoomType } from '@holium/realm-room';

export const Rooms = observer(() => {
  const { dimensions } = useTrayApps();
  const { spaces, theme } = useServices();
  const { windowColor } = theme.currentTheme;
  const [muted, setMuted] = useState(false);
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms();

  const ourSpace = spaces.selected?.type === 'our';

  const rooms = ourSpace
    ? roomsManager.rooms
    : (roomsManager.protocol as RealmProtocol).getSpaceRooms(
        spaces.selected!.path
      );

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
          ...theme,
          windowColor,
        }}
      >
        <Flex pl={3} pr={4} mr={3} justifyContent="center" alignItems="center">
          <Icons opacity={0.8} name="Connect" size={24} mr={3} />
          <Text
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Rooms
          </Text>
          {/* {roomsApp.isLoadingList && <Spinner pl={2} size={0} />} */}
        </Flex>
        <Flex ml={1} pl={2} pr={2}>
          <TextButton
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomsApp.setView('new-room');
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
        {rooms.length === 0 && (
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
        {rooms.map((room: RoomType, index: number) => {
          console.log('roompresent', JSON.stringify(room.present));
          return (
            <RoomRow
              key={`${room.title}-${index}`}
              rid={room.rid}
              title={room.title}
              provider={room.provider}
              present={room.present}
              // cursors={room.cursors}
              creator={room.creator}
              access={room.access}
              capacity={room.capacity}
              onClick={async (evt: any) => {
                evt.stopPropagation();
                if (roomsManager.presentRoom?.rid !== room.rid) {
                  roomsManager.enterRoom(room.rid);
                }
                roomsApp.setView('room');
              }}
            />
          );
        })}
      </Flex>
      {/* {roomsApp.invitesList.map((value: any) => (
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
      ))} */}
      <Flex mt={3} pb={4} justifyContent="space-between">
        {/* {roomsApp.provider !== ship!.patp && (
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
        )} */}
        {/* <IconButton
          mr={2}
          onClick={() => {
            // RoomsActions.requestAllRooms();
            // RoomsActions.refreshLocalRoom();
            // RoomsActions.getProvider();
          }}
        >
          <Icons opacity={0.8} name="Refresh" size={26} mx={2} />
        </IconButton> */}
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
        <IconButton
          onClick={(evt: any) => {
            evt.stopPropagation();
            roomsApp.setView('settings');
          }}
          color={theme.currentTheme.iconColor}
          customBg={theme.currentTheme.windowColor}
        >
          <Icons name="AudioControls" size={2} />
        </IconButton>
      </Flex>
    </Grid.Column>
  );
});
