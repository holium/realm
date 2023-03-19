import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { VideoCall } from './VideoCall';
import { VoiceCall } from './VoiceCall';
import { Landing } from './Landing';

const CampfirePresenter = () => {
  const { campfire } = useServices();
  console.log(campfire);
  const view = campfire.view || 'landing';
  console.log('view', view);
  return (
    <Flex flex={1} flexDirection="row" alignItems="center">
      {view === 'landing' && <Landing />}
      {view === 'video' && <VideoCall />}
      {view === 'voice' && <VoiceCall />}
    </Flex>
  );
};

export const Campfire = observer(CampfirePresenter);
