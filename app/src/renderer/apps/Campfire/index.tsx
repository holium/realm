import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { VideoCall } from './VideoCall';
import { VoiceCall } from './VoiceCall';
import { Landing } from './Landing';
import { useRooms } from '../Rooms/useRooms';

const CampfirePresenter = () => {
  const { campfire } = useServices();
  const manager = useRooms(ship?.patp);
  console.log('campfire', manager.campfire);
  const view = manager.campfire.room ? 'video' : 'landing';
  return (
    <Flex flex={1} minHeight={0}>
      {view === 'landing' && <Landing />}
      {view === 'video' && <VideoCall />}
      {view === 'voice' && <VoiceCall />}
    </Flex>
  );
};

export const Campfire = observer(CampfirePresenter);
