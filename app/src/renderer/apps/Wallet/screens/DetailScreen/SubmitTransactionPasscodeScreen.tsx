import { Flex, Icon, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../../components/PasscodeInput';

type Props = {
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: (passcode: number[]) => Promise<void>;
};

export const SubmitTransactionPasscodeScreen = ({
  checkPasscode,
  onSuccess,
}: Props) => (
  <Flex width="100%" height="100%" alignItems="center" justifyContent="center">
    <Flex flexDirection="column" gap="24px" alignItems="center">
      <Icon name="Locked" size={36} />
      <Flex
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="12px"
      >
        <Text.H3>Submit Transaction</Text.H3>
        <Text.Body>Enter your passcode to continue.</Text.Body>
      </Flex>
      <PasscodeInput
        checkStored
        checkPasscode={checkPasscode}
        onSuccess={onSuccess}
      />
    </Flex>
  </Flex>
);
