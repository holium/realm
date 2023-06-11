import { ethers } from 'ethers';
import styled from 'styled-components';

import {
  Box,
  Button,
  Flex,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

import { VerifyPasscode } from '../../../components/VerifyPasscode';

const NoResize = styled(Flex)`
  textarea {
    resize: none;
  }
`;

type Props = {
  recoverSeedPhrase: (passcode: number[]) => Promise<void>;
  checkPasscode: (code: number[]) => Promise<boolean>;
  phrase: string;
  updatePhrase: (phrase: string) => void;
  showPasscode: boolean;
  setShowPasscode: (show: boolean) => void;
  error: string;
  loading: boolean;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const RecoverExistingScreenBody = ({
  phrase,
  updatePhrase,
  recoverSeedPhrase,
  checkPasscode,
  showPasscode,
  setShowPasscode,
  error,
  loading,
  setScreen,
}: Props) => {
  return showPasscode ? (
    <VerifyPasscode
      checkPasscode={checkPasscode}
      onSuccess={recoverSeedPhrase}
    />
  ) : (
    <NoResize
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex flexDirection="column" gap="12px">
        <Text.H5>Recover wallet</Text.H5>
        <Text.Body opacity={0.7}>
          Please enter the mnemonic seed phrase for your existing Realm wallet.
        </Text.Body>
        <Flex width="100%" flexDirection="column" gap={10}>
          <Text.Label mb={1}>Seed phrase</Text.Label>
          <TextInput
            id="seed-phrase"
            name="seed-phrase"
            height="72px"
            required
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
          disabled={!ethers.utils.isValidMnemonic(phrase)}
          onClick={() => setShowPasscode(true)}
        >
          {loading ? <Spinner size={0} /> : 'Recover'}
        </Button.TextButton>
      </Flex>
    </NoResize>
  );
};
