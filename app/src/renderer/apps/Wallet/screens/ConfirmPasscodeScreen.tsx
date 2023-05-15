import { Flex, Text } from '@holium/design-system/general';

import { NewWalletScreen } from 'renderer/apps/Wallet/types';

import { PasscodeInput } from '../components/PasscodeInput';

type Props = {
  correctPasscode: number[];
  onSuccess: (passcode: number[]) => void;
  setScreen: (screen: NewWalletScreen) => void;
};

export const ConfirmPasscodeScreen = ({
  correctPasscode,
  onSuccess,
  setScreen,
}: Props) => (
  <Flex width="100%" height="100%" flexDirection="column" flex={5}>
    <Flex flex={1} flexDirection="column">
      <Flex gap={12} flexDirection="column">
        <Text.H5 variant="h5">Confirm passcode</Text.H5>
        <Text.Body variant="body">
          Please retype your passcode to confirm.
        </Text.Body>
      </Flex>
    </Flex>
    <Flex flex={4} justifyContent="center" alignItems="center">
      <PasscodeInput
        checkAgainst={correctPasscode}
        onSuccess={(passcode: number[]) => {
          onSuccess(passcode);
          setScreen(NewWalletScreen.FINALIZING);
        }}
      />
    </Flex>
  </Flex>
);
