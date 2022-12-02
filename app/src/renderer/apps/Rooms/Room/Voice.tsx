import { observer } from 'mobx-react';
import { FC } from 'react';
import { Flex } from 'renderer/components';
import { Speaker } from '../components/Speaker';
import { useRooms } from '../useRooms';

interface VoiceViewProps {
  host: string;
}

export const VoiceView: FC<VoiceViewProps> = observer(
  ({ host }: VoiceViewProps) => {
    const roomsManager = useRooms();
    if (!roomsManager.presentRoom) {
      return null;
    }
    const peers = Array.from(roomsManager.protocol.peers.keys());
    return (
      <Flex
        flex={2}
        gap={12}
        py={2}
        display="grid"
        gridTemplateColumns={peers.length + 1 ? `repeat(2, 1fr)` : '.5fr'}
        gridAutoColumns="1fr"
        gridAutoRows={'.5fr'}
      >
        <Speaker type="host" person={host} />
        {peers.map((person: string) => (
          <Speaker key={person} type="speaker" person={person} />
        ))}
      </Flex>
    );
  }
);
