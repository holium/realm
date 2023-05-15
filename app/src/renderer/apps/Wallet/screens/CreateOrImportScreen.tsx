import { Button, Flex, Icon, Text } from '@holium/design-system/general';

import { NewWalletScreen } from 'renderer/apps/Wallet/types';

type Props = {
  setScreen: (screen: NewWalletScreen) => void;
};

export const CreateOrImportScreen = ({ setScreen }: Props) => (
  <Flex flex={1} flexDirection="column">
    <Flex flex={1} flexDirection="column" gap="32px" justifyContent="center">
      <Flex flexDirection="column" gap={16} alignItems="center">
        <Text.H4 mt="100px" variant="h4">
          No Wallet Found
        </Text.H4>
        <Text.Body px="30px" variant="body" textAlign="center" opacity={0.7}>
          You haven't yet configured your Realm wallet.
        </Text.Body>
      </Flex>
      <Flex flexDirection="column" gap={10} alignItems="center">
        <Button.Primary onClick={() => setScreen(NewWalletScreen.BACKUP)}>
          <Flex py="4px" px="12px">
            Create wallet
          </Flex>
        </Button.Primary>
        <Button.Transparent onClick={() => setScreen(NewWalletScreen.IMPORT)}>
          <Flex py="4px" px="12px">
            Import wallet
          </Flex>
        </Button.Transparent>
      </Flex>
    </Flex>
    <Flex justifyContent="center" alignItems="center" gap="16px" m={3}>
      <Icon name="InfoCircle" fill="intent-caution" />
      <Text.Hint
        variant="hint"
        justifyContent="flex-end"
        color="intent-caution"
        fontSize="13px"
      >
        You are using pre-release software. Only use for development purposes.
      </Text.Hint>
    </Flex>
  </Flex>
);
