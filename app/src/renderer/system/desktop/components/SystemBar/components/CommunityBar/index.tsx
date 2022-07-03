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

  return (
    <SystemBarStyle pr={3} width="100%" customBg={dockColor}>
      <SpaceSelector />
      <Flex flex={1}>
        <AppDock />
      </Flex>
      <Flex>
        <IconButton
          customBg={dockColor}
          color={textColor}
          whileTap={{ scale: 0.9 }}
          transition={{ scale: 0.1 }}
          size={28}
          ml={1}
        >
          <Icons name="Connect" />
        </IconButton>
      </Flex>
    </SystemBarStyle>
  );
});

export default { CommunityBar };
