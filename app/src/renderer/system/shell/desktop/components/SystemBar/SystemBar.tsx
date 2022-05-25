import { FC, useCallback } from 'react';
import { useShip } from '../../../../../logic/store';
import { Flex } from '../../../../../components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

type SystemBarProps = {};

export const SystemBar: FC<SystemBarProps> = (props: SystemBarProps) => {
  const { ship } = useShip();
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
      <ShipTray ship={ship!} />
    </Flex>
  );
};

export default { SystemBar };
