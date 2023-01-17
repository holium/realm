import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Icons } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';
import PasscodeInput from '../../components/PasscodeInput';
import { useTrayApps } from 'renderer/apps/store';

interface PasscodeProps {
  onSuccess: (passcode: number[]) => void;
}

export const DeletePasscode: FC<PasscodeProps> = observer((props: PasscodeProps) => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();

  return (
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
        <PasscodeInput checkStored={true} onSuccess={props.onSuccess} keepLoading={true}/>
      </Flex>
    </Flex>
  );
});

export default DeletePasscode;
