import { Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';

import { Box, Button, Flex, Icon, Text } from '@holium/design-system';

import { NewWalletScreen } from './EthNew';

interface CreateProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

const CreatePresenter = ({ setScreen }: CreateProps) => (
  <Flex width="100%" height="100%" flexDirection="column">
    <Flex flex={4} flexDirection="column" alignItems="center" gap={10}>
      <Text.H4 mt="100px" variant="h4">
        No Wallet Found
      </Text.H4>
      <Text.Body px="30px" mt={2} mb={5} variant="body" textAlign="center">
        You haven't yet configured your Realm wallet.
      </Text.Body>
      <Box mt={9}>
        <Button.Primary onClick={() => setScreen(NewWalletScreen.BACKUP)}>
          Create a new wallet
        </Button.Primary>
      </Box>
      <Box>
        <Button.Transparent onClick={() => setScreen(NewWalletScreen.IMPORT)}>
          Or import an existing wallet
        </Button.Transparent>
      </Box>
    </Flex>
    <Flex mb={2} mx={3} justifyContent="center" alignItems="center">
      <Box>
        <Icon name="InfoCircle" />
      </Box>
      <Box>
        <Text.Hint
          ml={2}
          variant="hint"
          justifyContent="flex-end"
          color="intent-warning"
        >
          You are using pre-release software. Only use for development purposes.
        </Text.Hint>
      </Box>
    </Flex>
  </Flex>
);

export const Create = observer(CreatePresenter);
