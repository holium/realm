import { useState } from 'react';

import { Button, Flex, Text } from '@holium/design-system/general';

import { NewWalletScreen } from 'renderer/apps/Wallet/types';

import { WordPicker } from './WordPicker';

type Props = {
  seedPhrase: string;
  setScreen: (screen: NewWalletScreen) => void;
};

export const ConfirmScreen = ({ seedPhrase, setScreen }: Props) => {
  const [valid, setValid] = useState(false);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex flexDirection="column" alignItems="center" gap="16px">
        <Text.H5 variant="h5">Confirm words</Text.H5>
        <Text.Body variant="body">
          Verify you wrote the secret recovery phrase down correctly by clicking
          the following words in the correct order.
        </Text.Body>
        <WordPicker
          seedPhrase={seedPhrase}
          border="2px solid rgba(var(--rlm-border-rgba))"
          onValidChange={setValid}
        />
      </Flex>
      <Flex width="100%" gap="16px">
        <Button.Transparent
          flex={1}
          justifyContent="center"
          onClick={() => setScreen(NewWalletScreen.CREATE)}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          flex={1}
          disabled={!valid}
          justifyContent="center"
          onClick={() => setScreen(NewWalletScreen.PASSCODE)}
        >
          Confirm
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
