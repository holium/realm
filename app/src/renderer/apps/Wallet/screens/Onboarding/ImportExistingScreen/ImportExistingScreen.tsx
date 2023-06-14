import { useState } from 'react';
import { observer } from 'mobx-react';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';

import { ImportExistingScreenBody } from './ImportExistingScreenBody';

type Props = {
  setSeedPhrase: (phrase: string) => void;
  setScreen: (screen: WalletOnboardingScreen) => void;
};

const ImportExistingScreenPresenter = ({ setScreen, setSeedPhrase }: Props) => {
  const [phrase, setPhrase] = useState('');

  const saveSeedPhrase = () => {
    setSeedPhrase(phrase);
    setScreen(WalletOnboardingScreen.PASSCODE);
  };

  return (
    <ImportExistingScreenBody
      setScreen={setScreen}
      phrase={phrase}
      saveSeedPhrase={saveSeedPhrase}
      setPhrase={setPhrase}
    />
  );
};

export const ImportExistingScreen = observer(ImportExistingScreenPresenter);
