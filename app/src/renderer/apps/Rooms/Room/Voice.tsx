import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';

import { Speaker } from '../components/Speaker';
import { roomTrayConfig } from '../config';
import { useRoomsStore } from '../store/RoomsStoreContext';

const VoiceViewPresenter = () => {
  // const { roomsStore } = useShipStore();
  const roomsStore = useRoomsStore();

  const { loggedInAccount } = useAppState();

  const { setTrayAppHeight } = useTrayApps();
  const speakers = roomsStore.currentRoomPeers ?? [];

  useEffect(() => {
    const regularHeight = roomTrayConfig.dimensions.height;
    if (speakers.length + 1 > 4) {
      const tallHeight = roomTrayConfig.dimensions.height + 181 + 12;
      setTrayAppHeight(tallHeight);
    } else {
      setTrayAppHeight(regularHeight);
    }
  }, [speakers.length, setTrayAppHeight]);

  if (!roomsStore.currentRid) {
    return null;
  }
  return (
    <Flex
      flex={2}
      gap={12}
      py={2}
      style={{
        display: 'grid',
        gridTemplateColumns: speakers.length + 1 ? `repeat(2, 1fr)` : '.5fr',
        gridAutoColumns: '1fr',
        gridAutoRows: '.5fr',
      }}
    >
      <Speaker
        key={loggedInAccount?.serverId}
        type="our"
        person={loggedInAccount?.serverId ?? ''}
      />
      {speakers.map((peer: string) => (
        <Speaker key={peer} type="speaker" person={peer} />
      ))}
    </Flex>
  );
};

export const VoiceView = observer(VoiceViewPresenter);
