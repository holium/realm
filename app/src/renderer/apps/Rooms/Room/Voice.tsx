import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Speaker } from '../components/Speaker';
import { useRooms } from '../useRooms';

export const VoiceView = observer(() => {
  const roomsManager = useRooms();
  if (!roomsManager.presentRoom) {
    return null;
  }

  const us = roomsManager.protocol.our;
  const host = roomsManager.protocol.provider;
  const remainingPeers = Array.from(roomsManager.protocol.peers.keys()).filter(
    (patp) => patp !== host
  );

  return (
    <Flex
      flex={2}
      gap={12}
      py={2}
      display="grid"
      gridTemplateColumns={
        remainingPeers.length + 1 ? `repeat(2, 1fr)` : '.5fr'
      }
      gridAutoColumns="1fr"
      gridAutoRows={'.5fr'}
    >
      <Speaker type="host" person={host} />
      <Speaker type="speaker" person={us} />
      {remainingPeers.map((person: string) => (
        <Speaker key={person} type="speaker" person={person} />
      ))}
    </Flex>
  );
});
