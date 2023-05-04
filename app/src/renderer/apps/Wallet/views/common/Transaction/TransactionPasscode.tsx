import { observer } from 'mobx-react';

import { Flex, Icon, Text } from '@holium/design-system';

import { PasscodeInput } from '../../../components/PasscodeInput';

interface PasscodeProps {
  onSuccess: (passcode: number[]) => void;
}

const TransactionPasscodePresenter = (props: PasscodeProps) => {
  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      gap={10}
    >
      <Flex
        flex={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={10}
      >
        <Icon name="Locked" size={36} />
        <Text.H3 variant="h3">Submit Transaction</Text.H3>
      </Flex>
      <Flex flex={2} flexDirection="column" alignItems="center" gap={10}>
        <Text.Body variant="body">Enter your passcode to continue.</Text.Body>
        <PasscodeInput
          checkStored={true}
          onSuccess={props.onSuccess}
          keepLoading={true}
        />
      </Flex>
    </Flex>
  );
};

export const TransactionPasscode = observer(TransactionPasscodePresenter);
