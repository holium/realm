import { CommunityBar } from './components/CommunityBar';
import { HomeButton } from './components/HomeButton';

import { FC } from 'react';
import { Flex } from 'renderer/components';
import { ShipBar } from './components/ShipBar';

interface SystemBarProps {}

export const SystemBar: FC<SystemBarProps> = () => {
  return (
    <Flex margin={2} flexDirection="row" width="auto" gap={8}>
      <HomeButton />
      <CommunityBar />
      <ShipBar />
    </Flex>
  );
};

export default { SystemBar };
