import { observer } from 'mobx-react';
import { Flex, Text } from 'renderer/components';
import { PasscodeInput } from '../../../components/PasscodeInput';

interface CreatePasscodeProps {
  setPasscode: (passcode: number[]) => void;
}

export const CreatePasscode = observer((props: CreatePasscodeProps) => {
  return (
    <Flex width="100%" height="100%" flexDirection="column" flex={5}>
      <Flex flex={1} flexDirection="column">
        <Flex gap={12} flexDirection="column">
          <Text variant="h5">Set a passcode</Text>
          <Text variant="body">
            Set a 6-digit passcode to unlock your wallet. This adds an extra
            layer of security but is not needed to recover your wallet.
          </Text>
        </Flex>
      </Flex>
      <Flex flex={4} justifyContent="center" alignItems="center">
        <PasscodeInput checkStored={false} onSuccess={props.setPasscode} />
      </Flex>
    </Flex>
  );
});
