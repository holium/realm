import { useState } from 'react';
import { observer } from 'mobx-react';
import { RemotePeer, useRoomsManager } from '@holium/realm-room';
import { Button, Flex, Text, TextArea } from '@holium/design-system';
import { Loader } from './Loader';

const TextEditorPresenter = () => {
  const [content, setContent] = useState('');

  const { ship, roomsManager } = useRoomsManager();

  if (!roomsManager) return <Loader text="Loading %rooms-v2" />;

  const rooms = roomsManager.rooms;
  const presentRoom = roomsManager.presentRoom;
  const peers = Array.from(roomsManager.protocol.peers.keys())
    .map((patp) => roomsManager.protocol.peers.get(patp))
    .filter(Boolean) as RemotePeer[];

  // const onClickCreateRoom = () => {
  //   roomsManager.createRoom(
  //     'TESTING NEW BUILD DONT JOIN',
  //     'public',
  //     '/~lomder-librun/realm-forerunners'
  //   );
  // };

  // const onClickSendDataToRoom = () => {
  //   roomsManager.sendData({
  //     kind: DataPacket_Kind.DATA,
  //     value: {
  //       app: 'rooms',
  //       data: {
  //         test: 'test',
  //       },
  //     },
  //   });
  // };

  return (
    <Flex
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        alignItems="center"
        flexDirection="column"
        width="100%"
        maxWidth="600px"
        gap="24px"
        padding="24px"
        border="1px solid #000"
      >
        <Text.H1>
          In this room: {ship.ship}, {peers.length} peers
        </Text.H1>
        <Text.H2>Rooms: {rooms.length}</Text.H2>
        <Text.H2>Present room: {presentRoom?.path}</Text.H2>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            padding: '8px',
            minHeight: '200px',
          }}
        />
        <Flex gap="16px">
          <Button.Secondary height={32} px={2} fontSize="16px">
            Clear
          </Button.Secondary>
          <Button.Primary height={32} px={2} fontSize="16px">
            Submit
          </Button.Primary>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const TextEditor = observer(TextEditorPresenter);
