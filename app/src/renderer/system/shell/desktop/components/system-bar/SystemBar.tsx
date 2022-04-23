import { FC, useMemo } from 'react';
import { useMst } from '../../../../../logic/store';
import { clone } from 'mobx-state-tree';
import { Flex, Icons, Sigil } from '../../../../../components';
import { SystemBarStyle } from './SystemBar.styles';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

export const SystemBar: FC = () => {
  const { shipStore } = useMst();

  const ship = useMemo(() => clone(shipStore.session!), [shipStore.session]);

  const theme = {
    backgroundColor: ship.theme.backgroundColor,
    textColor: '#EDE6E1',
  };

  return (
    <Flex gap={8} margin="8px" flexDirection="row">
      <HomeButton theme={theme} />
      <CommunityBar theme={theme} />
      <ShipTray theme={theme} ship={ship} />
    </Flex>
  );
};

export default { SystemBar };
