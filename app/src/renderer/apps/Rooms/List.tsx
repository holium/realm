import { FC, useState, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer, Provider } from 'mobx-react';
import {
  Grid,
  Flex,
  Icons,
  Text,
  TextButton,
  IconButton,
  InnerNotification,
} from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { RoomRow } from './components/RoomRow';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { RoomsModelType } from 'os/services/tray/rooms.model';
import { rgba } from 'polished';
import { fontSize } from 'styled-system';
import { SoundActions } from 'renderer/logic/actions/sound';
import { ProviderSelector } from './components/ProviderSelector';
export type RoomListProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};
export const Rooms: FC<RoomListProps> = observer((props: RoomListProps) => {
  const { dimensions } = props;
  const { ship, desktop } = useServices();
  const { windowColor } = desktop.theme;
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

  const notif = false;

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

          {roomsApp.provider !== '' && roomsApp.provider !== ship!.patp && (
            <Flex className="realm-cursor-hover" justifyContent="center">
              <IconButton
                ml={2}
                color={'#000000'}
                opacity={0.5}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  // TODO set to current spacehost
                  RoomsActions.setProvider(ship!.patp!);
                }}
              >
                <Icons name="Logout" />
              </IconButton>
              <Text opacity={0.5} fontSize={2}>
                {roomsApp.provider}
              </Text>
            </Flex>
          )}
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
      <Flex style={{ marginTop: 54 }} flex={1} flexDirection="column">
        {roomsApp.invitesList.map((value: any) => (
          <InnerNotification
            id={value.id}
            title={value.id}
            seedColor="#F08735"
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
          // <Row
          //   noHover
          //   key={`${value.id}-invite`}
          //   baseBg={rgba(inviteColor, 0.12)}
          //   customBg={rgba(inviteColor, 0.16)}
          // >
          //   <Flex
          //     width="100%"
          //     alignItems="center"
          //     justifyContent="space-between"
          //     className="realm-cursor-hover"
          //   >
          //     <Text color={inviteColor} fontWeight={500} fontSize={2}>
          //       Invite: {value.id} - {value.invitedBy}
          //     </Text>

          //     <Flex gap={4}>
          //       <IconButton
          //         color={inviteColor}
          //         onClick={(evt: any) => {
          //           evt.stopPropagation();
          //           RoomsActions.acceptInvite(value.id);
          //         }}
          //       >
          //         <Icons name="Plus" />
          //       </IconButton>
          //       <IconButton
          //         color={'#D0384E'}
          //         onClick={(evt: any) => {
          //           evt.stopPropagation();
          //           console.log('clicked');
          //           RoomsActions.dismissInvite(value.id);
          //         }}
          //       >
          //         <Icons name="Close" />
          //       </IconButton>
          //     </Flex>
          //   </Flex>
          // </Row>
        ))}
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
              key={`${room!.title}-${index}`}
              id={room!.id}
              title={room!.title}
              provider={room!.provider}
              present={room!.present}
              cursors={room!.cursors}
              creator={room!.creator}
              access={room!.access}
              onClick={async (evt: any) => {
                evt.stopPropagation();
                if (!roomsApp.isRoomValid(room!.id)) {
                  console.log('invalid room!');
                  // TODO this check doesnt catch bad state
                } else if (roomsApp.isLiveRoom(room!.id)) {
                  RoomsActions.setView('room');
                } else if (room.present.includes(ship!.patp)) {
                  RoomsActions.setLiveRoom(toJS(room));
                  RoomsActions.setView('room');
                } else {
                  if (
                    // our old room was created by us
                    roomsApp.liveRoom! &&
                    roomsApp.isCreator(ship!.patp!, roomsApp.liveRoom.id)
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
      {notif && (
        <Flex flexDirection="column" width="100%">
          <InnerNotification
            id={'~lomder-librun/hacker-room'}
            title="Hacker Room"
            seedColor="#F08735"
            subtitle="Sent by: ~lomder-librun"
            actionText="Accept"
            onAction={(id: string) => {
              console.log('accepting invite', id);
            }}
            onDismiss={(id: string) => {
              console.log('removing invite', id);
            }}
          />
        </Flex>
      )}
      <Flex mt={3} pb={4} justifyContent="flex-end">
        <ProviderSelector
          seedColor={windowColor}
          onClick={() => {
            console.log('show provider setup');
          }}
        />
      </Flex>
    </Grid.Column>
  );
});
