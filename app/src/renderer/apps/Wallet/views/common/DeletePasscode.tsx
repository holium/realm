import { Flex, Icons, Text } from 'renderer/components';

import { PasscodeInput } from '../../components/PasscodeInput';

interface PasscodeProps {
  onSuccess: (passcode: number[]) => void;
}

export const DeletePasscode = (props: PasscodeProps) => (
  <Flex width="100%" height="100%" flexDirection="column" alignItems="center">
    <Flex
      flex={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Icons name="Locked" size={36} />
      <Text mt={2} variant="h3" color="red">
        Confirm Delete
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
