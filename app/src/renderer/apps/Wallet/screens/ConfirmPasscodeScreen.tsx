import { Flex, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../components/PasscodeInput';
import { WalletOnboardingScreen } from '../types';

type Props = {
  correctPasscode: number[];
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: (passcode: number[]) => Promise<void>;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const ConfirmPasscodeScreen = ({
  correctPasscode,
  checkPasscode,
  onSuccess,
  setScreen,
}: Props) => (
  <Flex
    width="100%"
    height="100%"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Flex flex={1} flexDirection="column">
      <Flex gap={12} flexDirection="column">
        <Text.H5 variant="h5">Confirm passcode</Text.H5>
        <Text.Body style={{ fontWeight: 300 }}>
          Please re-enter your passcode to confirm.
        </Text.Body>
      </Flex>
    </Flex>
    <Flex flex={4} justifyContent="center" alignItems="center">
      <PasscodeInput
        checkAgainst={correctPasscode}
        checkPasscode={checkPasscode}
        onSuccess={onSuccess}
        onClickForgotPasscode={() => setScreen(WalletOnboardingScreen.PASSCODE)}
      />
    </Flex>
  </Flex>
);
