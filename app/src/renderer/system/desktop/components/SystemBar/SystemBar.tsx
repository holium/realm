import { FC, useCallback } from 'react';
// import { useShip } from 'renderer/logic/store';
import { useServices } from 'renderer/logic/store';
import { Flex } from 'renderer/components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

type SystemBarProps = {};

export const SystemBar: FC<SystemBarProps> = (props: SystemBarProps) => {
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
