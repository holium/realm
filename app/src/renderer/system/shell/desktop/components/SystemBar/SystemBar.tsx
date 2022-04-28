import { FC, useMemo } from 'react';
import { useMst } from '../../../../../logic/store';
import { clone } from 'mobx-state-tree';
import { Flex } from '../../../../../components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

type SystemBarProps = {
  onHome: () => void;
};

export const SystemBar: FC<SystemBarProps> = (props: SystemBarProps) => {
  const { shipStore } = useMst();
  const { onHome } = props;

  const ship = useMemo(() => clone(shipStore.session!), [shipStore.session]);

  const theme = {
    backgroundColor: ship.theme.backgroundColor,
    textColor: '#EDE6E1',
  };

  return (
    <Flex gap={8} margin="8px" flexDirection="row">
      <HomeButton theme={theme} onHome={onHome} />
      <CommunityBar theme={theme} />
      <ShipTray theme={theme} ship={ship} />
    </Flex>
  );
};

export default { SystemBar };
