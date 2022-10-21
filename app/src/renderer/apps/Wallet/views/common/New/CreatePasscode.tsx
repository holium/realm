import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text } from 'renderer/components';
import PasscodeInput from '../../../components/PasscodeInput';

interface CreatePasscodeProps {
  setPasscode: (passcode: string) => void;
}

export const CreatePasscode: FC<CreatePasscodeProps> = observer((props: CreatePasscodeProps) => {
  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center"
    >
      <Flex flexDirection="column">
        <Text variant="h5">Set a passcode</Text>
        <Text mt={3} variant="body">
          Set a 6-digit passcode to unlock your wallet. This adds an extra layer
          of security but is not needed to recover your wallet.
        </Text>
      </Flex>
      <Flex alignItems="center">
       <PasscodeInput checkStored={false} onSuccess={props.setPasscode} />
      </Flex>
    </Flex>
  );
});

export default CreatePasscode;
