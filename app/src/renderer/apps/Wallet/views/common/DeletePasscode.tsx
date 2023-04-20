import { Flex, Text, Icon } from '@holium/design-system';
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
      <Icon name="Locked" size={36} />
      <Text.H3 variant="h3" color="red">
        Confirm Delete
      </Text.H3>
    </Flex>
    <Flex flex={2} flexDirection="column" alignItems="center">
      <Text.Body mb={8} variant="body">
        Enter your passcode to continue.
      </Text.Body>
      <PasscodeInput
        checkStored={true}
        onSuccess={props.onSuccess}
        keepLoading={true}
      />
    </Flex>
  </Flex>
);
