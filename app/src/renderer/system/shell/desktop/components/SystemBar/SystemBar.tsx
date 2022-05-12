import { FC } from 'react';
import { useShip } from '../../../../../logic/store';
import { Flex } from '../../../../../components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

type SystemBarProps = {
  onHome: () => void;
};

export const SystemBar: FC<SystemBarProps> = (props: SystemBarProps) => {
  const { ship } = useShip();
  const { onHome } = props;

  return (
    <Flex gap={8} margin="8px" flexDirection="row">
      <HomeButton onHome={onHome} />
      <CommunityBar />
      <ShipTray ship={ship!} />
    </Flex>
  );
};

export default { SystemBar };
