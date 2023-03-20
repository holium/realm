import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { VideoCall } from './VideoCall';
import { VoiceCall } from './VoiceCall';
import { Landing } from './Landing';

const CampfirePresenter = () => {
  const { campfire } = useServices();
  const view = campfire.view || 'landing';
  return (
    <Flex flex={1} minHeight={0}>
      {view === 'landing' && <Landing />}
      {view === 'video' && <VideoCall />}
      {view === 'voice' && <VoiceCall />}
    </Flex>
  );
};

export const Campfire = observer(CampfirePresenter);
