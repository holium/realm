import { observer } from 'mobx-react';
import { Flex, Icons, Text } from 'renderer/components';

import { PasscodeInput } from '../../../components/PasscodeInput';

interface LockedProps {
  onSuccess: any;
}

const VerifyPasscodePresenter = ({ onSuccess }: LockedProps) => (
  <Flex width="100%" height="100%" flexDirection="column" alignItems="center">
    <Flex
      flex={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Icons name="Locked" size={36} />
      <Text mt={2} variant="h3">
        Wallet Locked
      </Text>
    </Flex>
    <Flex flex={2} pt={8} flexDirection="column" alignItems="center">
      <Text mb={8} variant="body">
        Enter your passcode to continue.
      </Text>
      <PasscodeInput checkStored={true} onSuccess={onSuccess} />
    </Flex>
  </Flex>
);

export const VerifyPasscode = observer(VerifyPasscodePresenter);
