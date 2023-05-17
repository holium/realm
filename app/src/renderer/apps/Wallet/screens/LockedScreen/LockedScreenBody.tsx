import { Flex, Icon, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../../components/PasscodeInput';

type Props = {
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: () => void;
};

export const LockedScreenBody = ({ checkPasscode, onSuccess }: Props) => (
  <Flex width="100%" height="100%" alignItems="center" justifyContent="center">
    <Flex flexDirection="column" alignItems="center" gap="24px">
      <Icon name="Locked" size={36} />
      <Flex flexDirection="column" gap="12px" alignItems="center">
        <Text.H3>Wallet Locked</Text.H3>
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
