import { FC, useMemo } from 'react';
import { Flex, Icons, IconButton } from 'renderer/components';
import { SystemBarStyle } from '../../SystemBar.styles';
import { SpaceSelector } from './SpaceSelector';
import { useMst } from 'renderer/logic/store';
import { AppDock } from './AppDock';
import { observer } from 'mobx-react';

type CommunityBarProps = {};

export const CommunityBar: FC<CommunityBarProps> = observer(() => {
  const { themeStore } = useMst();

  const dockColor = useMemo(
    () => themeStore.theme.dockColor,
    [themeStore.theme.dockColor]
  );
  const textColor = useMemo(
    () => themeStore.theme.textColor,
    [themeStore.theme.textColor]
  );

  const iconColor = textColor;

  return (
    <SystemBarStyle pr={3} width="100%" customBg={dockColor}>
      <SpaceSelector />
      <Flex flex={1}>
        <AppDock />
      </Flex>
      <Flex>
        <IconButton customBg={dockColor} size={24} ml={1} color={iconColor}>
          <Icons name="Search" />
        </IconButton>
      </Flex>
    </SystemBarStyle>
  );
});

export default { CommunityBar };
