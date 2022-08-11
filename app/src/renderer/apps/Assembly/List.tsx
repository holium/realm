import { FC, useState, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Grid, Flex, Icons, Text, TextButton } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { AssemblyRow } from './components/AssemblyRow';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { RoomsModelType } from 'os/services/tray/rooms.model';

export type AssemblyListProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Assemblies: FC<AssemblyListProps> = observer(
  (props: AssemblyListProps) => {
    const { dimensions } = props;
    const { ship, desktop } = useServices();
    const { windowColor } = desktop.theme;
    const [muted, setMuted] = useState(false);
    const { roomsApp } = useTrayApps();
    const knownRoomsMap = roomsApp.knownRooms;
    const knownRooms = roomsApp.list;
    const amHosting =
      knownRooms.findIndex((a: any) => a.host === ship?.patp) !== -1;

    useEffect(() => {
      RoomsActions.requestAllRooms();
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
          <Flex
            pl={3}
            pr={4}
            mr={3}
            justifyContent="center"
            alignItems="center"
          >
            <Icons opacity={0.8} name="Connect" size={26} mr={2} />
            <Text
              opacity={0.8}
              style={{ textTransform: 'uppercase' }}
              fontWeight={600}
            >
              Rooms
            </Text>
          </Flex>
          <Flex ml={1} pl={2} pr={2}>
            <TextButton
              disabled={amHosting}
              onClick={(evt: any) => {
                evt.stopPropagation();
                RoomsActions.setView('new-assembly');
              }}
            >
              Create
            </TextButton>
          </Flex>
        </Titlebar>
        <Flex style={{ marginTop: 54 }} flex={1} flexDirection="column">
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
              <AssemblyRow
                key={`${room!.title}-${index}`}
                id={room!.id}
                title={room!.title}
                provider={room!.provider}
                present={room!.present}
                cursors={room!.cursors}
                access={room!.access}
                onClick={async (evt: any) => {
                  evt.stopPropagation();
                  if (roomsApp.liveRoom?.id === room.id) {
                    console.log('changeview');
                    RoomsActions.setView('room');
                  } else if (room.present.includes(ship!.patp)) {
                    console.log('setlive');
                    RoomsActions.setLiveRoom(toJS(room));
                    RoomsActions.setView('room');
                  } else {
                    console.log('joining room');

                    await RoomsActions.joinRoom(room.id);
                    RoomsActions.setView('room');
                    await RoomsActions.requestAllRooms();
                  }
                }}
              />
            );
          })}
        </Flex>
      </Grid.Column>
    );
  }
);
