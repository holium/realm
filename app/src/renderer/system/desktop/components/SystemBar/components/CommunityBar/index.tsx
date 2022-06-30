import { FC, useMemo } from 'react';
import { Flex, Icons, IconButton } from 'renderer/components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';

type CommunityBarProps = {};

export const CommunityBar: FC<CommunityBarProps> = observer(() => {
  const { shell } = useServices();
  const { desktop } = shell;

  const dockColor = useMemo(
    () => desktop.theme.dockColor,
    [desktop.theme.dockColor]
  );
  const textColor = useMemo(
    () => desktop.theme.textColor,
    [desktop.theme.textColor]
  );

  const iconColor = textColor;

  return (
    <SystemBarStyle pr={3} width="100%" customBg={dockColor}>
      <SpaceSelector />
      <Flex flex={1}>
        <AppDock />
      </Flex>
      <Flex>
        {/* <IconButton customBg={dockColor} size={24} ml={1} color={iconColor}>
          <Icons name="Search" />
        </IconButton> */}
      </Flex>
    </SystemBarStyle>
  );
});

export default { CommunityBar };
