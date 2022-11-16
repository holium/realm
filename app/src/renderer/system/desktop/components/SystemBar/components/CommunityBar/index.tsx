import { FC, useMemo } from 'react';
import { Flex } from 'renderer/components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { RoomTray } from './Rooms';
import { rgba } from 'polished';

interface CommunityBarProps {}

export const CommunityBar: FC<CommunityBarProps> = observer(() => {
  const { theme } = useServices();

  const { dockColor } = useMemo(
    () => ({
      ...theme.currentTheme,
      dockColor: rgba(theme.currentTheme.dockColor, 0.55),
    }),
    [theme.currentTheme.dockColor]
  );

  return (
    <SystemBarStyle
      initial={{ backgroundColor: dockColor }}
      animate={{ backgroundColor: dockColor }}
      transition={{ backgroundColor: { duration: 0.5 } }}
      pr={3}
      width="100%"
      backgroundColor={dockColor}
    >
      <SpaceSelector />
      <Flex flex={1}>
        <AppDock />
      </Flex>
      <Flex>
        <RoomTray />
      </Flex>
    </SystemBarStyle>
  );
});

export default { CommunityBar };
