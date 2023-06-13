import { observer } from 'mobx-react';

import {
  Avatar,
  Button,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';

type Props = {
  onClickCog: () => void;
};

const StandaloneChatPassportPreviewPresenter = ({ onClickCog }: Props) => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <Flex
      width="100%"
      height="65px"
      borderTop="1px solid var(--rlm-base-color)"
      padding="12px"
      gap="12px"
      alignItems="center"
    >
      <Flex flex={1} alignItems="center" gap="12px">
        <Avatar
          simple
          clickable={false}
          borderRadiusOverride="4px"
          size={40}
          patp={loggedInAccount.serverId}
          avatar={loggedInAccount.avatar}
          sigilColor={[loggedInAccount.color || '#000000', 'white']}
        />
        <Flex flexDirection="column">
          <Text.H5 style={{ fontSize: '16px' }}>
            {loggedInAccount.nickname}
          </Text.H5>
          <Text.Body style={{ fontSize: '14px' }} opacity={0.5}>
            {loggedInAccount.serverId}
          </Text.Body>
        </Flex>
      </Flex>
      <Button.IconButton iconColor="text" onClick={onClickCog}>
        <Icon name="Settings" fill="text" opacity={0.25} size={22} />
      </Button.IconButton>
    </Flex>
  );
};

export const StandaloneChatPassportPreview = observer(
  StandaloneChatPassportPreviewPresenter
);
