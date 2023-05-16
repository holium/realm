import { useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Box, Button, Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { NewWalletScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { VerifyPasscode } from '../components/VerifyPasscode';

const NoResize = styled(Flex)`
  textarea {
    resize: none;
  }
`;

type Props = {
  setSeedPhrase: (phrase: string, passcode: number[]) => void;
  setScreen: (screen: NewWalletScreen) => void;
};

const RecoverExistingScreenPresenter = ({
  setSeedPhrase,
  setScreen,
}: Props) => {
  const { walletStore } = useShipStore();
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [_loading, setLoading] = useState(false);

  const [showPasscode, setShowPasscode] = useState(false);

  const updatePhrase = (newPhrase: string) => {
    setError('');
    setPhrase(newPhrase);
  };

  const recoverSeedPhrase = async (passcode: number[]) => {
    setLoading(true);
    const correct = await walletStore.checkMnemonic(phrase);
    setLoading(false);

    if (correct) {
      setSeedPhrase(phrase, passcode);
      walletStore.watchUpdates();
      setScreen(NewWalletScreen.FINALIZING);
      setError('');
    } else {
      setError(
        'This mnemonic did not match your existing Realm wallet public key.'
      );
    }
  };

  return showPasscode ? (
    <VerifyPasscode
      checkPasscode={walletStore.checkPasscode}
      onSuccess={recoverSeedPhrase}
    />
  ) : (
    <NoResize width="100%" height="100%" flexDirection="column" gap={10}>
      <Text.H4 variant="h4">Recover Wallet</Text.H4>
      <Text.Body variant="body">
        Please enter the mnemonic seed phrase for your existing wallet.
      </Text.Body>
      <Flex width="100%" flexDirection="column" gap={10}>
        <Text.Label mb={1}>Seed phrase</Text.Label>
        <TextInput
          id="seed-phrase"
          name="seed-phrase"
          height="72px"
          required={true}
          type="textarea"
          value={phrase}
          cols={50}
          onChange={(e) =>
            updatePhrase((e.target as HTMLTextAreaElement).value)
          }
        />

        <Box hidden={error === ''}>
          <Text.Body variant="body" fontSize={1}>
            {error}
          </Text.Body>
        </Box>
        <Flex width="100%">
          <Button.TextButton
            width="100%"
            disabled={!ethers.utils.isValidMnemonic(phrase)}
            onClick={() => setShowPasscode(true)}
          >
            Recover
          </Button.TextButton>
        </Flex>
      </Flex>
      <Flex
        position="absolute"
        top="582px"
        zIndex={999}
        onClick={() => setScreen(NewWalletScreen.DETECTED_EXISTING)}
      >
        <Icon name="ArrowLeftLine" size={2} />
      </Flex>
    </NoResize>
  );
};

export const RecoverExistingScreen = observer(RecoverExistingScreenPresenter);
