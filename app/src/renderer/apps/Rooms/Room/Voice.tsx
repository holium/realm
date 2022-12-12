import { observer } from 'mobx-react';
import { trayStore } from 'renderer/apps/store';
import { Flex } from 'renderer/components';
import { Speaker } from '../components/Speaker';
import { useRooms } from '../useRooms';
import { useEffect } from 'react';

export const VoiceView = observer(() => {
  const roomsManager = useRooms();
  if (!roomsManager.presentRoom) {
    return null;
  }

  const { setTrayAppHeight } = trayStore;

  const host = roomsManager.protocol.provider;
  const speakers = [
    ...Array.from(roomsManager.protocol.peers.keys()),
    roomsManager.protocol.our,
  ].filter((person: string) => person !== host);

  useEffect(() => {
    const regularHeight = 500;
    if (speakers.length + 1 > 4) {
      const tallHeight = 500 + 181 + 12;
      setTrayAppHeight(tallHeight);
    } else {
      setTrayAppHeight(regularHeight);
    }
  }, [speakers.length, setTrayAppHeight]);

  return (
    <Flex
      flex={2}
      gap={12}
      py={2}
      display="grid"
      gridTemplateColumns={speakers.length + 1 ? `repeat(2, 1fr)` : '.5fr'}
      gridAutoColumns="1fr"
      gridAutoRows={'.5fr'}
    >
      <Speaker key={host} type="host" person={host} />
      {speakers.map((person: string) => (
        <Speaker key={person} type="speaker" person={person} />
      ))}
    </Flex>
  );
});
