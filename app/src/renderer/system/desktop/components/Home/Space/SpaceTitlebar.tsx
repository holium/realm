import { MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { SpacePicture } from 'renderer/components';
import { Flex, Button, Icon } from '@holium/design-system';
import { AppSearchApp } from '../AppInstall/AppSearch';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

interface SpaceTitlebarProps {
  space: SpaceModelType;
  membersCount: number;
  showAppGrid: boolean;
  showMembers: boolean;
  onMemberClick: (evt: MouseEvent) => void;
  onToggleApps: (evt: MouseEvent) => void;
}

const SpaceTitlebarPresenter = (props: SpaceTitlebarProps) => {
  const {
    space,
    membersCount,
    showAppGrid,
    showMembers,
    onMemberClick,
    onToggleApps,
  } = props;

  return (
    <Flex style={{ position: 'relative' }} width="100%">
      <Flex flex={1}>
        <SpacePicture size={40} membersCount={membersCount} space={space} />
      </Flex>
      <Flex alignItems="center" gap={12}>
        <AppSearchApp mode="space" />
        <Flex flex={1} gap={8} justifyContent="flex-end">
          <Button.IconButton
            // size={3}
            // color={showAppGrid ? highlightColor : theme.iconColor}
            onClick={onToggleApps}
          >
            <Icon name="AppGrid" size={22} />
          </Button.IconButton>
          <Button.IconButton
            size={32}
            // size={3}
            // customBg={iconHoverColor}
            // color={showMembers ? highlightColor : theme.iconColor}
            onClick={onMemberClick}
          >
            <Icon name="Members" size={22} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const SpaceTitlebar = observer(SpaceTitlebarPresenter);
