import { FC, useMemo, Dispatch, SetStateAction, useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Icons, Label, Input, Box } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface RecoverExistingProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

export const RecoverExisting: FC<RecoverExistingProps> = observer((props: RecoverExistingProps) => {
  const { theme } = useServices();
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
  }

  const recoverSeedPhrase = async () => {
    setLoading(true);
    let correct = await WalletActions.checkMnemonic(phrase);
    setLoading(false);

    if (correct) {
      props.setScreen(NewWalletScreen.PASSCODE); // TODO: change to confirm after demo
      setError('');
    } else {
      setError('This mnemonic did not match your existing Realm wallet public key.');
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
        <Input
          height="72px"
          required={true}
          as="textarea"
          value={phrase}
          onChange={(e) => updatePhrase(e.target.value)}
          autoFocus={true}
        />
        <Box mt={3} hidden={error === ''}>
          <Text variant="body" fontSize={1} color={themeData.colors.text.error}>
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
});
