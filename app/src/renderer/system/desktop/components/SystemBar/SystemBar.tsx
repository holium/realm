import { FC } from 'react';
import { Flex } from 'renderer/components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

type SystemBarProps = {};

export const SystemBar: FC<SystemBarProps> = () => {
  return (
    <Flex
      onContextMenu={(evt: any) => {
        evt.stopPropagation();
      }}
      gap={8}
      margin="8px"
      flexDirection="row"
    >
      <HomeButton />
      <CommunityBar />
      <ShipTray />
    </Flex>
  );
};

export default { SystemBar };
