import { observer } from 'mobx-react';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';

type Props = {
  onClickCancel: () => void;
  onClickDelete: () => void;
};

const CancelWalletCreationScreenPresenter = ({
  onClickCancel,
  onClickDelete,
}: Props) => {
  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex flex={1} />
      <Flex flex={2} flexDirection="column" alignItems="center" gap="24px">
        <Icon name="Info" size={32} opacity={0.5} />
        <Flex flexDirection="column" gap="12px" alignItems="center">
          <Text.H4>Cancel setup</Text.H4>
          <Text.Body textAlign="center" px="30px" opacity={0.7}>
            Are you sure? Starting over requires a new seed phrase.
          </Text.Body>
        </Flex>
      </Flex>
      <Flex width="100%" gap={16}>
        <Button.TextButton
          flex={1}
          color="intent-alert"
          justifyContent="center"
          onClick={onClickDelete}
        >
          Yes, cancel setup
        </Button.TextButton>
        <Button.TextButton
          flex={1}
          justifyContent="center"
          onClick={onClickCancel}
        >
          No, continue
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

export const CancelWalletCreationScreen = observer(
  CancelWalletCreationScreenPresenter
);
