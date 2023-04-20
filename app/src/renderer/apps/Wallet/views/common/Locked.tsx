import { Flex, Text, Icon } from '@holium/design-system';
import { PasscodeInput } from '../../components/PasscodeInput';
import { useShipStore } from 'renderer/stores/ship.store';
import { observer } from 'mobx-react';

export const Locked = observer(() => {
  const { walletStore } = useShipStore();
  const unlock = () => {
    walletStore.navigateBack();
    walletStore.watchUpdates();
  };

  return (
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
      <Flex flex={2} flexDirection="column" alignItems="center">
        <Text.Body mb={8} variant="body">
          Enter your passcode to continue.
        </Text.Body>
        <PasscodeInput checkStored={true} onSuccess={unlock} />
      </Flex>
    </Flex>
  );
});
