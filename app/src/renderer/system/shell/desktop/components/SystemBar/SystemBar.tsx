import { FC, useMemo } from 'react';
import { useMst, useShip } from '../../../../../logic/store';
import { toJS } from 'mobx';
import { Flex } from '../../../../../components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';

type SystemBarProps = {
  onHome: () => void;
};

export const SystemBar: FC<SystemBarProps> = (props: SystemBarProps) => {
  const { ship } = useShip();
  const { themeStore } = useMst();
  const { onHome } = props;

  console.log(toJS(themeStore));

  return (
    <Flex gap={8} margin="8px" flexDirection="row">
      <HomeButton theme={themeStore} onHome={onHome} />
      <CommunityBar theme={themeStore} />
      <ShipTray theme={themeStore} ship={ship!} />
    </Flex>
  );
};

export default { SystemBar };
