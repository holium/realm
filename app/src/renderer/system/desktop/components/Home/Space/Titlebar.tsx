import { MouseEvent, useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import { Flex, SpacePicture, Icons, IconButton } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import AppSearchApp from '../AppInstall/AppSearch';
import { useServices } from 'renderer/logic/store';

interface SpaceTitlebarProps {
  space: SpaceModelType;
  membersCount: number;
  showAppGrid: boolean;
  showMembers: boolean;
  onMemberClick: (evt: MouseEvent) => void;
  onToggleApps: (evt: MouseEvent) => void;
}

export const SpaceTitlebar = observer((props: SpaceTitlebarProps) => {
  const {
    space,
    membersCount,
    showAppGrid,
    showMembers,
    onMemberClick,
    onToggleApps,
  } = props;
  const { theme: baseTheme } = useServices();
  const theme = baseTheme.currentTheme;

  const iconHoverColor = useMemo(
    () => rgba(darken(0.03, theme.iconColor), 0.1),
    [theme.iconColor]
  );

  const highlightColor = '#4E9EFD';

  return (
    <Flex style={{ position: 'relative' }} width="100%">
      <Flex flex={1}>
        <SpacePicture
          size={40}
          membersCount={membersCount}
          space={space}
          textColor={theme.textColor}
        />
      </Flex>
      <Flex alignItems="center" gap={12}>
        <AppSearchApp mode="space" />
        <Flex flex={1} gap={8} justifyContent="flex-end">
          <IconButton
            size={3}
            customBg={iconHoverColor}
            color={showAppGrid ? highlightColor : theme.iconColor}
            onClick={onToggleApps}
          >
            <Icons name="AppGrid" size="22px" />
          </IconButton>
          <IconButton
            size={3}
            customBg={iconHoverColor}
            color={showMembers ? highlightColor : theme.iconColor}
            onClick={onMemberClick}
          >
            <Icons name="Members" size="22px" />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
});
