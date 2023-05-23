import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { WalletScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { FinalizingScreenBody } from './FinalizingScreenBody';

type Props = {
  seedPhrase: string;
  passcode: number[];
};

const FinalizingScreenPresenter = ({ seedPhrase, passcode }: Props) => {
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

  return <FinalizingScreenBody />;
};

export const FinalizingScreen = observer(FinalizingScreenPresenter);
