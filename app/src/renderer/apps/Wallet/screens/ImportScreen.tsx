import { ChangeEvent, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

import { Button, Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

const NoResize = styled(Flex)`
  textarea {
    resize: none;
  }
`;

type Props = {
  setSeedPhrase: (phrase: string) => void;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const ImportScreen = ({ setScreen, setSeedPhrase }: Props) => {
  const [phrase, setPhrase] = useState('');

  const saveSeedPhrase = () => {
    setSeedPhrase(phrase);
    setScreen(WalletOnboardingScreen.PASSCODE);
  };

  return (
    <NoResize
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex flexDirection="column" gap={12}>
        <Text.H4 mt={24} variant="h4">
          Import Wallet
        </Text.H4>
        <Text.Body mt={2} variant="body">
          If you have an existing mnemonic seed phrase, you can load it into
          Realm now.
        </Text.Body>
        <Text.Label mb={1}>Seed phrase</Text.Label>
        <TextInput
          id="seed-phrase"
          name="seed-phrase"
          height="72px"
          required={true}
          type="textarea"
          value={phrase}
          cols={50}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPhrase(e.target.value)
          }
        />
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
          justifyContent="center"
          disabled={!ethers.utils.isValidMnemonic(phrase)}
          onClick={saveSeedPhrase}
        >
          Save
        </Button.TextButton>
      </Flex>
    </NoResize>
  );
};
