import { Button, Flex, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../../components/PasscodeInput';
import { WalletOnboardingScreen } from '../../types';

type Props = {
  passcode: number[];
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  setPasscode: (passcode: number[]) => void;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

export const CreatePasscodeScreen = ({
  checkPasscode,
  passcode,
  setPasscode,
  setScreen,
}: Props) => {
  return (
    <Flex width="100%" height="100%" flexDirection="column" flex={5}>
      <Flex flex={1} flexDirection="column">
        <Flex gap={12} flexDirection="column">
          <Text.H5>Set a passcode</Text.H5>
          <Text.Body opacity={0.7}>
            Set a 6-digit passcode to unlock your wallet. This adds an extra
            layer of security but is not needed to recover your wallet.
          </Text.Body>
        </Flex>
      </Flex>
      <Flex flex={4} justifyContent="center" alignItems="center">
        <PasscodeInput
          checkStored={false}
          checkPasscode={checkPasscode}
          onSuccess={async (passcode: number[]) => setPasscode(passcode)}
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
          disabled={passcode.length !== 6}
          justifyContent="center"
          onClick={() => {
            setScreen(WalletOnboardingScreen.CONFIRM_PASSCODE);
          }}
        >
          Confirm
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
