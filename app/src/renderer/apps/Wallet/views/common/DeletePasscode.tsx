import { Flex, Icon, Text } from '@holium/design-system';

import { PasscodeInput } from '../../components/PasscodeInput';

type Props = {
  onSuccess: (passcode: number[]) => void;
};

export const DeletePasscode = ({ onSuccess }: Props) => (
  <Flex width="100%" height="100%" flexDirection="column" alignItems="center">
    <Flex
      flex={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Icon name="Locked" size={36} />
      <Text.H3 variant="h3" color="intent-caution">
        Confirm Delete
      </Text.H3>
    </Flex>
    <Flex flex={2} flexDirection="column" alignItems="center">
      <Text.Body mb={8} variant="body">
        Enter your passcode to continue.
      </Text.Body>
      <PasscodeInput
        checkStored={true}
        onSuccess={onSuccess}
        keepLoading={true}
      />
    </Flex>
  </Flex>
);
