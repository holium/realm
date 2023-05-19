import { Flex, Icon, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../PasscodeInput';

type Props = {
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: (passcode: number[]) => Promise<void>;
};

export const TransactionPasscode = ({ checkPasscode, onSuccess }: Props) => (
  <Flex
    width="100%"
    height="100%"
    flexDirection="column"
    alignItems="center"
    gap={10}
  >
    <Flex
      flex={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Icon name="Locked" size={36} />
      <Text.H3 variant="h3">Submit Transaction</Text.H3>
    </Flex>
    <Flex flex={2} flexDirection="column" alignItems="center">
      <Text.Body variant="body">Enter your passcode to continue.</Text.Body>
      <PasscodeInput
        checkStored
        checkPasscode={checkPasscode}
        onSuccess={onSuccess}
      />
    </Flex>
  </Flex>
);
