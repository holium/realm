import { useEffect } from 'react';
import { ethers } from 'ethers';

import {
  Button,
  CopyButton,
  Flex,
  HideButton,
  Text,
} from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

type Props = {
  seedPhrase: string;
  setScreen: (screen: WalletOnboardingScreen) => void;
  setSeedPhrase: (phrase: string) => void;
};

export const BackupScreen = ({
  seedPhrase,
  setScreen,
  setSeedPhrase,
}: Props) => {
  const hideSeedPhrase = useToggle(false);

  useEffect(() => {
    if (!seedPhrase) {
      setSeedPhrase(ethers.Wallet.createRandom().mnemonic.phrase);
    }
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
        <Text.H5>Back up your wallet</Text.H5>
        <Text.Body opacity={0.7}>
          Your secret recovery phrase is used to restore your wallet.
        </Text.Body>
        <Text.Body opacity={0.7}>
          Save these 12 words and store them in a safe place. Don't share them
          with anyone.
        </Text.Body>
        <Flex
          mt="32px"
          width="100%"
          flexDirection="column"
          alignItems="center"
          border="1px solid rgba(var(--rlm-border-rgba))"
          background="rgba(var(--rlm-border-rgba), 0.1)"
          borderRadius="9px"
        >
          <Text.Body
            p="16px"
            maxWidth="250px"
            style={{
              lineHeight: '26px',
              fontSize: '14px',
              wordSpacing: '7px',
              textAlign: 'center',
              filter: hideSeedPhrase.isOn ? 'blur(10px)' : 'none',
            }}
          >
            {seedPhrase}
          </Text.Body>
          <Flex width="100%" justifyContent="space-between" padding="8px">
            <HideButton
              isOn={hideSeedPhrase.isOn}
              onClick={hideSeedPhrase.toggle}
            />
            <CopyButton content={seedPhrase} label="Copy" />
          </Flex>
        </Flex>
      </Flex>
      <Flex width="100%" gap={16}>
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
          onClick={() => setScreen(WalletOnboardingScreen.CONFIRM)}
        >
          I wrote it down
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
