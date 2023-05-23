import { Flex, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../components/PasscodeInput';

type Props = {
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  setPasscode: (passcode: number[]) => Promise<void>;
};

export const CreatePasscodeScreen = ({ checkPasscode, setPasscode }: Props) => (
  <Flex width="100%" height="100%" flexDirection="column" flex={5}>
    <Flex flex={1} flexDirection="column">
      <Flex gap={12} flexDirection="column">
        <Text.H5>Set a passcode</Text.H5>
        <Text.Body fontWeight={300}>
          Set a 6-digit passcode to unlock your wallet. This adds an extra layer
          of security but is not needed to recover your wallet.
        </Text.Body>
      </Flex>
    </Flex>
    <Flex flex={4} justifyContent="center" alignItems="center">
      <PasscodeInput
        checkStored={false}
        checkPasscode={checkPasscode}
        onSuccess={setPasscode}
      />
    </Flex>
  </Flex>
);
