import { Flex, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../components/PasscodeInput';

type Props = {
  correctPasscode: number[];
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: (passcode: number[]) => Promise<void>;
};

export const ConfirmPasscodeScreen = ({
  correctPasscode,
  checkPasscode,
  onSuccess,
}: Props) => (
  <Flex width="100%" height="100%" flexDirection="column">
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
      />
    </Flex>
  </Flex>
);
