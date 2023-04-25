import { Flex } from '@holium/design-system';

import { CommunityBar } from './components/CommunityBar';
import { HomeButton } from './components/HomeButton';
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
