import { CommunityBar } from './components/CommunityBar';
import { HomeButton } from './components/HomeButton';
import { Flex } from 'renderer/components';
import { ShipBar } from './components/ShipBar';

export const SystemBar = () => (
  <Flex
    position="relative"
    zIndex={14}
    margin={2}
    flexDirection="row"
    width="auto"
    gap={8}
  >
    <HomeButton />
    <CommunityBar />
    <ShipBar />
  </Flex>
);
