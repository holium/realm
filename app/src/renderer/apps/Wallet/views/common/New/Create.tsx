import { Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Text } from '@holium/design-system';

import { NewWalletScreen } from './EthNew';

interface CreateProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

const CreatePresenter = ({ setScreen }: CreateProps) => (
  <Flex width="100%" height="100%" flexDirection="column">
    <Flex flex={1} flexDirection="column" gap="32px" justifyContent="center">
      <Flex flexDirection="column" gap={10} alignItems="center">
        <Text.H4 mt="100px" variant="h4">
          No Wallet Found
        </Text.H4>
        <Text.Body px="30px" mt={2} mb={5} variant="body" textAlign="center">
          You haven't yet configured your Realm wallet.
        </Text.Body>
      </Flex>
      <Flex flexDirection="column" gap={10} alignItems="center">
        <Button.Primary onClick={() => setScreen(NewWalletScreen.BACKUP)}>
          <Text.Body py="4px" px="12px" variant="body">
            Create wallet
          </Text.Body>
        </Button.Primary>
        <Button.Transparent onClick={() => setScreen(NewWalletScreen.IMPORT)}>
          <Text.Body py="4px" px="12px" variant="body">
            Import wallet
          </Text.Body>
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

export const Create = observer(CreatePresenter);
