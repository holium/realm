import { useState } from 'react';
import { observer } from 'mobx-react';

import { useToggle } from '@holium/design-system';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { RecoverExistingScreenBody } from './RecoverExistingScreenBody';

type Props = {
  setSeedPhrase: (phrase: string, passcode: number[]) => void;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

const RecoverExistingScreenPresenter = ({
  setSeedPhrase,
  setScreen,
}: Props) => {
  const { walletStore } = useShipStore();
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const loading = useToggle(false);

  const [showPasscode, setShowPasscode] = useState(false);

  const updatePhrase = (newPhrase: string) => {
    setError('');
    setPhrase(newPhrase);
  };

  const recoverSeedPhrase = async (passcode: number[]) => {
    loading.toggleOn();
    const correct = await walletStore.checkMnemonic(phrase);
    loading.toggleOff();

    if (correct) {
      setSeedPhrase(phrase, passcode);
      walletStore.watchUpdates();
      setScreen(WalletOnboardingScreen.FINALIZING);
      setError('');
    } else {
      setError(
        'This mnemonic did not match your existing Realm wallet public key.'
      );
    }
  };

  return (
    <RecoverExistingScreenBody
      phrase={phrase}
      updatePhrase={updatePhrase}
      recoverSeedPhrase={recoverSeedPhrase}
      checkPasscode={walletStore.checkPasscode}
      showPasscode={showPasscode}
      setShowPasscode={setShowPasscode}
      error={error}
      loading={loading.isOn}
      setScreen={setScreen}
    />
  );
};

export const RecoverExistingScreen = observer(RecoverExistingScreenPresenter);
