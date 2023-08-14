import { Button, Flex, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../../components/PasscodeInput';
import { WalletOnboardingScreen } from '../../types';

type Props = {
  correctPasscode: number[];
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  setScreen: (screen: WalletOnboardingScreen) => void;
  canContinue: boolean;
  setCanContinue: (canContinue: boolean) => void;
};

export const ConfirmPasscodeScreen = ({
  correctPasscode,
  checkPasscode,
  setScreen,
  canContinue,
  setCanContinue,
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
        <Text.Body opacity={0.7}>
          Please re-enter your passcode to confirm.
        </Text.Body>
      </Flex>
    </Flex>
    <Flex flex={4} justifyContent="center" alignItems="center">
      <PasscodeInput
        checkAgainst={correctPasscode}
        checkPasscode={checkPasscode}
        onSuccess={async () => setCanContinue(true)}
        onError={() => setCanContinue(false)}
      />
    </Flex>
    <Flex width="100%" gap="16px">
      <Button.Transparent
        flex={1}
        justifyContent="center"
        onClick={() => setScreen(WalletOnboardingScreen.PASSCODE)}
      >
        Go back
      </Button.Transparent>
      <Button.TextButton
        flex={1}
        isDisabled={!canContinue}
        justifyContent="center"
        onClick={() => setScreen(WalletOnboardingScreen.FINALIZING)}
      >
        Confirm
      </Button.TextButton>
    </Flex>
  </Flex>
);
