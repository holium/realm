import { FC, Dispatch, SetStateAction, useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icon } from '@holium/design-system';
import { NewWalletScreen } from './index';
import { VerifyPasscode } from './VerifyPasscode';
import { useShipStore } from 'renderer/stores/ship.store';

const NoResize = styled(Flex)`
  textarea {
    resize: none;
  }
`;

interface RecoverExistingProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  setSeedPhrase: (phrase: string, passcode: number[]) => void;
}

export const RecoverExisting: FC<RecoverExistingProps> = observer(
  (props: RecoverExistingProps) => {
    const { walletStore } = useShipStore();
    const [phrase, setPhrase] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        props.setSeedPhrase(phrase, passcode);
        walletStore.watchUpdates();
        props.setScreen(NewWalletScreen.FINALIZING);
        setError('');
      } else {
        setError(
          'This mnemonic did not match your existing Realm wallet public key.'
        );
      }
    };

    return showPasscode ? (
      <VerifyPasscode
        onSuccess={(code: number[]) => {
          recoverSeedPhrase(code);
        }}
      />
    ) : (
      <NoResize width="100%" height="100%" flexDirection="column">
        <Text.H4 mt={6} variant="h4">
          Recover Wallet
        </Text.H4>
        <Text.Body mt={2} variant="body">
          Please enter the mnemonic seed phrase for your existing wallet.
        </Text.Body>
        <Flex mt={9} width="100%" flexDirection="column">
          <Text.Label mb={1}>Seed phrase</Text.Label>
          <Text.TextInput
            id="seed-phrase"
            name="seed-phrase"
            height="72px"
            required={true}
            type="textarea"
            value={phrase}
            cols={50}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updatePhrase(e.target.value)
            }

            // autoFocus={true}
          />

          <Box mt={3} hidden={error === ''}>
            <Text.Body variant="body" fontSize={1}>
              {error}
            </Text.Body>
          </Box>
          <Flex mt={7} width="100%">
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
          onClick={() => props.setScreen(NewWalletScreen.DETECTED_EXISTING)}
        >
          <Icon name="ArrowLeftLine" size={2} />
        </Flex>
      </NoResize>
    );
  }
);
