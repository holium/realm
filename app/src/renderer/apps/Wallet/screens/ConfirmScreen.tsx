import { useState } from 'react';

import { Button, Flex, Text } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

import { resetOnboarding } from './WalletOnboarding';
import { WordPicker } from './WordPicker';

type Props = {
  seedPhrase: string;
  setSeedPhrase: (phrase: string) => void;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const ConfirmScreen = ({
  seedPhrase,
  setSeedPhrase,
  setScreen,
}: Props) => {
  const [valid, setValid] = useState(false);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex flexDirection="column" gap="16px">
        <Text.H5 variant="h5">Confirm words</Text.H5>
        <Text.Body style={{ fontWeight: 300 }}>
          Verify you wrote the secret recovery phrase down correctly by clicking
          the following words in the correct order.
        </Text.Body>
        <WordPicker seedPhrase={seedPhrase} onValidChange={setValid} />
      </Flex>
      <Flex width="100%" gap="16px">
        <Button.Transparent
          flex={1}
          justifyContent="center"
          onClick={() => resetOnboarding(setScreen, setSeedPhrase)}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          flex={1}
          disabled={!valid}
          justifyContent="center"
          onClick={() => setScreen(WalletOnboardingScreen.PASSCODE)}
        >
          Confirm
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
