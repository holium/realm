import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';

import { Speaker } from '../components/Speaker';
import { roomTrayConfig } from '../config';
import { useRooms } from '../useRooms';

const VoiceViewPresenter = () => {
  const { loggedInAccount } = useAppState();
  const roomsManager = useRooms(loggedInAccount?.patp);

  const { setTrayAppHeight } = useTrayApps();

  const our = roomsManager?.local.patp;
  const speakers = roomsManager
    ? [...Array.from(roomsManager.protocol.peers.keys())]
    : []; //.filter((patp) => patp !== our);

  useEffect(() => {
    const regularHeight = roomTrayConfig.dimensions.height;
    if (speakers.length + 1 > 4) {
      const tallHeight = roomTrayConfig.dimensions.height + 181 + 12;
      setTrayAppHeight(tallHeight);
    } else {
      setTrayAppHeight(regularHeight);
    }
  }, [speakers.length, setTrayAppHeight]);

  if (!roomsManager?.live.room) {
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
      <Speaker key={our} type="our" person={our ?? ''} />
      {speakers.map((person: string) => (
        <Speaker key={person} type="speaker" person={person} />
      ))}
    </Flex>
  );
};

export const VoiceView = observer(VoiceViewPresenter);
