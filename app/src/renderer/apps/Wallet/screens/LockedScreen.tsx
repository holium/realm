import { observer } from 'mobx-react';

import { Flex, Icon, Text } from '@holium/design-system/general';

import { useShipStore } from 'renderer/stores/ship.store';

import { PasscodeInput } from '../components/PasscodeInput';

const LockedScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const unlock = () => {
    walletStore.navigateBack();
    walletStore.getWalletsUpdate();
    walletStore.watchUpdates();
  };

  return (
    <Flex width="100%" height="100%" flexDirection="column" alignItems="center">
      <Flex
        flex={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={10}
      >
        <Icon name="Locked" size={36} />
        <Text.H3 variant="h3">Wallet Locked</Text.H3>
      </Flex>
      <Flex flex={2} flexDirection="column" alignItems="center" gap={20}>
        <Text.Body variant="body">Enter your passcode to continue.</Text.Body>
        <PasscodeInput checkStored={true} onSuccess={unlock} />
      </Flex>
    </Flex>
  );
};

export const LockedScreen = observer(LockedScreenPresenter);