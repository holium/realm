import { FC, useMemo } from 'react';
import { Flex, Icons, IconButton } from 'renderer/components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { AssemblyTray } from './Assembly';
import { rgba } from 'polished';

type CommunityBarProps = {};

export const CommunityBar: FC<CommunityBarProps> = observer(() => {
  const { desktop } = useServices();

  const { dockColor } = useMemo(
    () => ({
      ...desktop.theme,
      dockColor: rgba(desktop.theme.dockColor!, 0.55),
    }),
    [desktop.theme.dockColor]
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
        <AssemblyTray />
      </Flex>
    </SystemBarStyle>
  );
});

export default { CommunityBar };
