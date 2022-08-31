import { Patp } from 'os/types';
import { FC } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, Grid, Icons, Text } from 'renderer/components';
// import Row from 'renderer/components/Row';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';


interface RoomInfoProps {}

export const RoomInfo: FC<RoomInfoProps> = (props: RoomInfoProps) => {
  const { roomsApp } = useTrayApps();
  const room = roomsApp.liveRoom!;
  const { desktop } = useServices();
  const theme = desktop.theme;

  const rowGap = 16

  return (
    
    <Flex flex={2} gap={16} p={2} flexDirection="column" alignItems="center">
      <Flex flexDirection='row'
        overflowX="scroll"
        opacity={0.7}
        style={{
          cursor: 'none',
          borderRadius: 6,
          // backgroundColor: theme.inputColor,
          // backgroundColor: 'rgba(0, 0, 0, 0.05)',
          // color: 'rgba(0, 0, 0, 0.5)',
          padding: 12,
          paddingBottom: 16,
          paddingTop: 16,
          maxHeight:300,
          // TODO border?
          // borderColor: theme.textColor,
          // borderStyle: 'solid',
          // border: 1
        }}
        >
        <Grid.Column gap={rowGap}>
          <Text>Room ID:</Text>
          <Text>Creator:</Text>

          <Text>Access:</Text>
          <Text>Capacity:</Text>
          {/* <Text>Whitelist:</Text> */}

        </Grid.Column>

        <Grid.Column gap={rowGap}>
          <Text>{room.id}</Text>
          <Text>{room.creator}</Text>

          <Text>{room.access}</Text>

          <Text>{`${room.present.length}/${room.capacity}`}</Text>

          {/* <Flex flexDirection='column'>
          {room.whitelist.map((patp: Patp, index: number) => {
            return (
              <Flex key={`room-whitelist-${patp}`}>
                <Text>{patp}</Text>
              </Flex>
              )})}
          </Flex> */}
        </Grid.Column>
      </Flex>
       
    </Flex>
  );
};
