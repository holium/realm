import { useEffect } from 'react';
import { ethers } from 'ethers';

import { Button, CopyButton, Flex, Text } from '@holium/design-system/general';

import { NewWalletScreen } from 'renderer/apps/Wallet/types';

type Props = {
  seedPhrase: string;
  setScreen: (screen: NewWalletScreen) => void;
  setSeedPhrase: (phrase: string) => void;
};

export const BackupScreen = ({
  seedPhrase,
  setScreen,
  setSeedPhrase,
}: Props) => {
  useEffect(() => {
    setSeedPhrase(ethers.Wallet.createRandom().mnemonic.phrase);
  }, []);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex flexDirection="column" gap="12px">
        <Text.H5 variant="h5">Back up your Wallet</Text.H5>
        <Text.Body mt={3} variant="body">
          Your secret recovery phrase is used to restore your wallet.
        </Text.Body>
        <Text.Body mt={2} variant="body">
          Save these 12 words and store them in a safe place. Don’t share them
          with anyone.
        </Text.Body>
        <Flex
          p="16px"
          mt="32px"
          gap="16px"
          width="100%"
          flexDirection="column"
          border="1px solid rgba(var(--rlm-icon-rgba))"
          borderRadius="9px"
        >
          <Text.Body
            style={{
              wordSpacing: '7px',
              textAlign: 'center',
              fontSize: '18px',
            }}
          >
            {seedPhrase}
          </Text.Body>
          <Flex width="100%" justifyContent="flex-end">
            <CopyButton content={seedPhrase} label="Copy" />
          </Flex>
        </Flex>
      </Flex>
      <Flex width="100%" gap={16}>
        <Button.Transparent
          flex={1}
          justifyContent="center"
          onClick={() => setScreen(NewWalletScreen.CREATE)}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          flex={1}
          justifyContent="center"
          onClick={() => setScreen(NewWalletScreen.CONFIRM)}
        >
          I wrote it down
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
