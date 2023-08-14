import { ChangeEvent } from 'react';
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
  setScreen: (screen: WalletOnboardingScreen) => void;
  phrase: string;
  setPhrase: (phrase: string) => void;
  saveSeedPhrase: () => void;
};

export const ImportExistingScreenBody = ({
  setScreen,
  phrase,
  setPhrase,
  saveSeedPhrase,
}: Props) => (
  <NoResize
    width="100%"
    height="100%"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Flex flexDirection="column" gap={12}>
      <Text.H5 mt={24}>Import wallet</Text.H5>
      <Text.Body mt={2} opacity={0.7}>
        If you have an existing mnemonic seed phrase, you can load it into Realm
        below.
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
        isDisabled={!ethers.utils.isValidMnemonic(phrase)}
        onClick={saveSeedPhrase}
      >
        Import
      </Button.TextButton>
    </Flex>
  </NoResize>
);
