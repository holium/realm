import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Icons } from 'renderer/components';
import PasscodeInput from '../../../components/PasscodeInput';

interface PasscodeProps {
  onSuccess: (passcode: number[]) => void;
}

export const TransactionPasscode: FC<PasscodeProps> = observer(
  (props: PasscodeProps) => {
    return (
      <Flex
        width="100%"
        height="100%"
        flexDirection="column"
        alignItems="center"
      >
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Icons name="Locked" size={36} />
          <Text mt={2} variant="h3">
            Submit Transaction
          </Text>
        </Flex>
        <Flex flex={2} pt={8} flexDirection="column" alignItems="center">
          <Text mb={8} variant="body">
            Enter your passcode to continue.
          </Text>
          <PasscodeInput
            checkStored={true}
            onSuccess={props.onSuccess}
            keepLoading={true}
          />
        </Flex>
      </Flex>
    );
  }
);

export default TransactionPasscode;
