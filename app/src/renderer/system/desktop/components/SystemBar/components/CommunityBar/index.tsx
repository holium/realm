import { FC, useMemo } from 'react';
import { Flex, Icons, IconButton } from 'renderer/components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { SpaceSelector } from './SpaceSelector';
import { AppDock } from './AppDock';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store-2';

type CommunityBarProps = {};

export const CommunityBar: FC<CommunityBarProps> = observer(() => {
  const { shell } = useServices();
  const { theme } = shell;

  const dockColor = useMemo(
    () => theme.theme.dockColor,
    [theme.theme.dockColor]
  );
  const textColor = useMemo(
    () => theme.theme.textColor,
    [theme.theme.textColor]
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
