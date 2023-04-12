import { MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { Flex, Button, Icon } from '@holium/design-system';
import { SpacePicture } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { AppSearchApp } from '../AppInstall/AppSearch';

interface SpaceTitlebarProps {
  space: SpaceModelType;
  membersCount: number;
  showAppGrid: boolean;
  showMembers: boolean;
  onMemberClick: (evt: MouseEvent) => void;
  onToggleApps: (evt: MouseEvent) => void;
}

const SpaceTitlebarPresenter = ({
  space,
  membersCount,
  showAppGrid,
  showMembers,
  onMemberClick,
  onToggleApps,
}: SpaceTitlebarProps) => {
  return (
    <Flex style={{ position: 'relative' }} width="100%">
      <Flex flex={1}>
        <SpacePicture size={40} membersCount={membersCount} space={space} />
      </Flex>
      <Flex alignItems="center" gap={12}>
        <AppSearchApp mode="space" />
        <Flex flex={1} gap={8} justifyContent="flex-end">
          <Button.IconButton
            size={3}
            customColor={showAppGrid ? 'accent' : 'icon'}
            onClick={onToggleApps}
          >
            <Icon name="AppGrid" size="22px" />
          </Button.IconButton>
          <Button.IconButton
            size={3}
            customColor={showMembers ? 'accent' : 'icon'}
            onClick={onMemberClick}
          >
            <Icon name="Members" size="22px" />
          </Button.IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const SpaceTitlebar = observer(SpaceTitlebarPresenter);
