import { useState } from 'react';

import { Button, Flex, Text } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

import { WordPicker } from '../../components/WordPicker';

type Props = {
  seedPhrase: string;
  setScreen: (screen: WalletOnboardingScreen) => void;
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
      <Flex flexDirection="column" gap="16px">
        <Text.H5 variant="h5">Confirm words</Text.H5>
        <Text.Body opacity={0.7}>
          Verify you wrote the secret recovery phrase down correctly by clicking
          the following words in the correct order.
        </Text.Body>
        <WordPicker seedPhrase={seedPhrase} onValidChange={setValid} />
      </Flex>
      <Flex width="100%" gap="16px">
        <Button.Transparent
          flex={1}
          justifyContent="center"
          onClick={() => setScreen(WalletOnboardingScreen.CANCEL)}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          flex={1}
          isDisabled={!valid}
          justifyContent="center"
          onClick={() => {
            localStorage.removeItem('WalletOnboardingWordPickerState');
            setScreen(WalletOnboardingScreen.PASSCODE);
          }}
        >
          Confirm
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
