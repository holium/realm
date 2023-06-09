import { useEffect } from 'react';
import { observer } from 'mobx-react';

import {
  WalletOnboardingScreen,
  WalletScreen,
} from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { resetOnboarding } from '../WalletOnboarding';
import { FinalizingScreenBody } from './FinalizingScreenBody';

type Props = {
  setScreen: (screen: WalletOnboardingScreen) => void;
  seedPhrase: string;
  setSeedPhrase: (phrase: string) => void;
  passcode: number[];
  setPasscode: (passcode: number[]) => void;
};

const FinalizingScreenPresenter = ({
  setScreen,
  seedPhrase,
  setSeedPhrase,
  passcode,
  setPasscode,
}: Props) => {
  const { walletStore } = useShipStore();
  const initWallet = async () => {
    if (seedPhrase && passcode) {
      await walletStore.setMnemonic(seedPhrase, passcode);
      walletStore.navigate(WalletScreen.LIST);
      // wipe local storage
      resetOnboarding(setScreen, setSeedPhrase, setPasscode);
      // await walletStore.watchUpdates();
    }
  };

  useEffect(() => {
    initWallet();
  }, [seedPhrase, passcode]);

  return <FinalizingScreenBody />;
};

export const FinalizingScreen = observer(FinalizingScreenPresenter);
