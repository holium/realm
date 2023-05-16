import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system/general';

import { WalletScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

interface FinalizingProps {
  seedPhrase: string;
  passcode: number[];
}

const FinalizingScreenPresenter = ({
  seedPhrase,
  passcode,
}: FinalizingProps) => {
  const { walletStore } = useShipStore();
  const initWallet = async () => {
    if (seedPhrase && passcode) {
      await walletStore.setMnemonic(seedPhrase, passcode);
      walletStore.navigate(WalletScreen.LIST);
      // await walletStore.watchUpdates();
    }
  };

  useEffect(() => {
    initWallet();
  }, [seedPhrase, passcode]);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner size={3} />
      <Text.Custom mt={6} fontSize={3}>
        Creating wallet...
      </Text.Custom>
    </Flex>
  );
};

export const FinalizingScreen = observer(FinalizingScreenPresenter);
