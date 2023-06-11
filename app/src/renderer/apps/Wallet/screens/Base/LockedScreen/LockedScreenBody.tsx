import { Flex, Icon, Text } from '@holium/design-system/general';

import { PasscodeInput } from '../../../components/PasscodeInput';

type Props = {
  onClickForgotPasscode: () => void;
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onSuccess: (passcode: number[]) => Promise<void>;
};

export const LockedScreenBody = ({
  onClickForgotPasscode,
  checkPasscode,
  onSuccess,
}: Props) => (
  <Flex
    width="100%"
    height="100%"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap="24px"
  >
    <Icon name="Locked" size={36} />
    <Flex flexDirection="column" gap="12px" alignItems="center">
      <Text.H3>Wallet Locked</Text.H3>
      <Text.Body>Enter your passcode to continue.</Text.Body>
    </Flex>
    <PasscodeInput
      checkStored
      onClickForgotPasscode={onClickForgotPasscode}
      checkPasscode={checkPasscode}
      onSuccess={onSuccess}
    />
  </Flex>
);
