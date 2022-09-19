import { FC, MouseEvent, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import {
  Flex,
  SpacePicture,
  Input,
  Icons,
  IconButton,
} from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { ThemeModelType } from 'os/services/theme.model';
import AppSearchApp from '../AppSearch';
import { useServices } from 'renderer/logic/store';

type SpaceTitlebarProps = {
  space: SpaceModelType;
  membersCount: number;
  theme: ThemeModelType;
  showAppGrid: boolean;
  showMembers: boolean;
  onMemberClick: (evt: MouseEvent) => void;
  onToggleApps: (evt: MouseEvent) => void;
};

export const SpaceTitlebar: FC<SpaceTitlebarProps> = observer(
  (props: SpaceTitlebarProps) => {
    const {
      space,
      membersCount,
      theme,
      showAppGrid,
      showMembers,
      onMemberClick,
      onToggleApps,
    } = props;
    const { membership } = useServices();

    const iconHoverColor = useMemo(
      () => rgba(darken(0.03, theme.iconColor), 0.1),
      [theme.windowColor]
    );

    const highlightColor = '#4E9EFD';

    return (
      <Flex width="100%">
        <Flex flex={1}>
          <SpacePicture
            size={40}
            membersCount={membersCount}
            space={space}
            textColor={theme.textColor}
          />
        </Flex>
        <Flex alignItems="center" gap={12}>
          <AppSearchApp />
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
  }
);
