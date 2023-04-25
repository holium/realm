import { Flex, Icon, Text } from '@holium/design-system';
import { observer } from 'mobx-react';

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
      <Icon name="Locked" size={36} />
      <Text.H3 mt={2} variant="h3">
        Wallet Locked
      </Text.H3>
    </Flex>
    <Flex flex={2} flexDirection="column" alignItems="center" gap={10}>
      <Text.Body mb={8} variant="body">
        Enter your passcode to continue.
      </Text.Body>
      <PasscodeInput checkStored={true} onSuccess={onSuccess} />
    </Flex>
  </Flex>
);

export const VerifyPasscode = observer(VerifyPasscodePresenter);
