import { Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icon } from '@holium/design-system';
import { NewWalletScreen } from './index';

interface CreateProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

const CreatePresenter = (props: CreateProps) => {
  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Flex flex={4} flexDirection="column" alignItems="center" gap={10}>
        <Text.H4 mt="100px" variant="h4">
          No Wallet Found
        </Text.H4>
        <Text.Body px="30px" mt={2} mb={5} variant="body" textAlign="center">
          You haven't yet configured your Realm wallet.
        </Text.Body>
        <Box mt={9}>
          <Button.TextButton
            onClick={() => props.setScreen(NewWalletScreen.BACKUP)}
          >
            Create a new wallet
          </Button.TextButton>
        </Box>
        <Box>
          <Button.TextButton
            onClick={() => props.setScreen(NewWalletScreen.IMPORT)}
          >
            Or import an existing wallet
          </Button.TextButton>
        </Box>
      </Flex>
      <Flex mb={2} mx={3} justifyContent="center" alignItems="center">
        <Box>
          <Icon name="InfoCircle" />
        </Box>
        <Box>
          <Text.Hint ml={2} variant="hint" justifyContent="flex-end">
            You are using pre-release software. Only use for development
            purposes.
          </Text.Hint>
        </Box>
      </Flex>
    </Flex>
  );
};

export const Create = observer(CreatePresenter);
