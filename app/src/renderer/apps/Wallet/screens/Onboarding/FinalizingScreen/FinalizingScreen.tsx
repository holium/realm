import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import {
  WalletOnboardingScreen,
  WalletScreen,
} from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { resetOnboarding } from '../../WalletOnboarding';
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
      // For testing
      return;
      await walletStore.setMnemonic(seedPhrase, passcode);
      walletStore.navigate(WalletScreen.LIST);
      // wipe local storage
      resetOnboarding(setScreen, setSeedPhrase, setPasscode);
      // await walletStore.watchUpdates();
    }
  };

  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const timeoutID = setTimeout(() => setStuck(true), 30000);

    return () => {
      clearTimeout(timeoutID);
    };
  }, []);

  useEffect(() => {
    initWallet();
  }, [seedPhrase, passcode]);

  return <FinalizingScreenBody stuck={stuck} setScreen={setScreen} />;
};

export const FinalizingScreen = observer(FinalizingScreenPresenter);
