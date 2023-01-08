import {
  FC,
  useMemo,
  Dispatch,
  SetStateAction,
  useState,
  ChangeEvent,
} from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Icons, Label, Box } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { TextInput } from '@holium/design-system';
import { useTrayApps } from 'renderer/apps/store';
import { WalletView } from 'os/services/tray/wallet-lib/wallet.model';

interface RecoverExistingProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  setSeedPhrase: (phrase: string) => void;
}

export const RecoverExisting: FC<RecoverExistingProps> = observer(
  (props: RecoverExistingProps) => {
    const { theme } = useServices();
    const { walletApp } = useTrayApps();
    const themeData = useMemo(
      () => getBaseTheme(theme.currentTheme),
      [theme.currentTheme]
    );
    const [phrase, setPhrase] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updatePhrase = (newPhrase: string) => {
      setError('');
      setPhrase(newPhrase);
    };

    const recoverSeedPhrase = async () => {
      setLoading(true);
      const correct = await WalletActions.checkMnemonic(phrase);
      setLoading(false);

      if (correct) {
        props.setSeedPhrase(phrase);
        WalletActions.navigate(WalletView.LOCKED);
        setError('');
      } else {
        setError(
          'This mnemonic did not match your existing Realm wallet public key.'
        );
      }
    };

    return (
      <Flex width="100%" height="100%" flexDirection="column">
        <Text mt={6} variant="h4">
          Recover Wallet
        </Text>
        <Text mt={2} variant="body" color={themeData.colors.text.secondary}>
          Please enter the mnemonic seed phrase for your existing wallet.
        </Text>
        <Flex mt={9} width="100%" flexDirection="column">
          <Label mb={3} required={true}>
            Seed phrase
          </Label>
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
            autoFocus={true}
          />

          <Box mt={3} hidden={error === ''}>
            <Text
              variant="body"
              fontSize={1}
              color={themeData.colors.text.error}
            >
              {error}
            </Text>
          </Box>
          <Flex mt={7} width="100%">
            <Button
              width="100%"
              disabled={!ethers.utils.isValidMnemonic(phrase)}
              onClick={recoverSeedPhrase}
              isLoading={loading}
            >
              Recover
            </Button>
          </Flex>
        </Flex>
        <Flex
          position="absolute"
          top="582px"
          zIndex={999}
          onClick={() => props.setScreen(NewWalletScreen.DETECTED_EXISTING)}
        >
          <Icons
            name="ArrowLeftLine"
            size={2}
            color={theme.currentTheme.iconColor}
          />
        </Flex>
      </Flex>
    );
  }
);
