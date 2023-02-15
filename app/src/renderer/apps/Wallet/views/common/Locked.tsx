import { Flex, Text, Icons } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { PasscodeInput } from '../../components/PasscodeInput';

export const Locked = () => {
  const unlock = () => {
    WalletActions.navigateBack();
    WalletActions.watchUpdates();
  };

  return (
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
        <PasscodeInput checkStored={true} onSuccess={unlock} />
      </Flex>
    </Flex>
  );
};
