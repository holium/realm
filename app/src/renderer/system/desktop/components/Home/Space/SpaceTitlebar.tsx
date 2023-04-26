import { MouseEvent } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon } from '@holium/design-system';

import { SpacePicture } from 'renderer/components';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

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
          <Button.IconButton size={32} onClick={onToggleApps}>
            <Icon name="AppGrid" size={22} />
          </Button.IconButton>
          <Button.IconButton size={32} onClick={onMemberClick}>
            <Icon name="Members" size={22} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const SpaceTitlebar = observer(SpaceTitlebarPresenter);
