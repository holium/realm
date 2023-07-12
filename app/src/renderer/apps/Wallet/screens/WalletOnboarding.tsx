import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Spinner } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { BackupScreen } from './Onboarding/BackupScreen';
import { CancelWalletCreationScreen } from './Onboarding/CancelWalletCreationScreen';
import { ConfirmPasscodeScreen } from './Onboarding/ConfirmPasscodeScreen';
import { ConfirmScreen } from './Onboarding/ConfirmScreen';
import { CreatePasscodeScreen } from './Onboarding/CreatePasscodeScreen';
import { DetectedExistingScreen } from './Onboarding/DetectedExistingScreen';
import { FinalizingScreen } from './Onboarding/FinalizingScreen/FinalizingScreen';
import { ImportExistingScreen } from './Onboarding/ImportExistingScreen/ImportExistingScreen';
import { NoWalletFoundScreen } from './Onboarding/NoWalletFoundScreen';
import { RecoverExistingScreen } from './Onboarding/RecoverExistingScreen/RecoverExistingScreen';

export const resetOnboarding = (
  setScreen: any,
  setSeedPhrase?: any,
  setPasscode?: any
) => {
  setScreen(WalletOnboardingScreen.NO_WALLET);
  setSeedPhrase && setSeedPhrase('');
  setPasscode && setPasscode([]);
  // also delete local storage for safety
  localStorage.removeItem('WalletOnboardingScreen');
  localStorage.removeItem('WalletOnboardingSeedPhrase');
  localStorage.removeItem('WalletOnboardingPasscode');
  localStorage.removeItem('WalletOnboardingWordPickerState');
};

const WalletOnboardingPresenter = () => {
  const { walletStore } = useShipStore();

  const initialScreen = walletStore.initialized
    ? WalletOnboardingScreen.DETECTED_EXISTING
    : WalletOnboardingScreen.NO_WALLET;

  useEffect(() => {
    if (walletStore.initialized) {
      setScreen(WalletOnboardingScreen.DETECTED_EXISTING);
    } else {
      setScreen(WalletOnboardingScreen.NO_WALLET);
    }
  }, [walletStore.initialized]);

  const loading = useToggle(true);
  const [screen, setScreen] = useState<WalletOnboardingScreen>(initialScreen);
  const [passcode, setPasscode] = useState<number[]>([]);
  const [canContinue, setCanContinue] = useState(false);

  // TODO move this to background thread
  const [seedPhrase, setSeedPhrase] = useState('');

  useEffect(() => {
    const screen = localStorage.getItem('WalletOnboardingScreen');
    if (screen) {
      setScreen(screen as WalletOnboardingScreen);
    }
    const passcode = localStorage.getItem('WalletOnboardingPasscode');
    if (passcode) {
      setPasscode(JSON.parse(passcode) as number[]);
    }
    const seedPhrase = localStorage.getItem('WalletOnboardingSeedPhrase');
    if (seedPhrase) {
      setSeedPhrase(seedPhrase);
    }
    loading.toggleOff();
  }, []);

  useEffect(() => {
    if (
      ![
        WalletOnboardingScreen.CANCEL,
        WalletOnboardingScreen.IMPORT,
        WalletOnboardingScreen.RECOVER_EXISTING,
        WalletOnboardingScreen.DETECTED_EXISTING,
        WalletOnboardingScreen.NO_WALLET,
      ].includes(screen)
    ) {
      localStorage.setItem('WalletOnboardingScreen', screen);
    }
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('WalletOnboardingPasscode', JSON.stringify(passcode));
  }, [passcode]);

  useEffect(() => {
    localStorage.setItem('WalletOnboardingSeedPhrase', seedPhrase);
  }, [seedPhrase]);

  const components = {
    [WalletOnboardingScreen.NO_WALLET]: (
      <NoWalletFoundScreen setScreen={setScreen} />
    ),
    [WalletOnboardingScreen.IMPORT]: (
      <ImportExistingScreen
        setSeedPhrase={setSeedPhrase}
        setScreen={setScreen}
      />
    ),
    [WalletOnboardingScreen.BACKUP]: (
      <BackupScreen
        setScreen={setScreen}
        setSeedPhrase={setSeedPhrase}
        seedPhrase={seedPhrase}
      />
    ),
    [WalletOnboardingScreen.CANCEL]: (
      <CancelWalletCreationScreen
        onClickCancel={() => {
          const screen = localStorage.getItem('WalletOnboardingScreen');
          if (screen) {
            setScreen(screen as WalletOnboardingScreen);
          } else {
            setScreen(initialScreen);
          }
        }}
        onClickDelete={() =>
          resetOnboarding(setScreen, setSeedPhrase, setPasscode)
        }
      />
    ),
    [WalletOnboardingScreen.CONFIRM]: (
      <ConfirmScreen setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [WalletOnboardingScreen.PASSCODE]: (
      <CreatePasscodeScreen
        checkPasscode={walletStore.checkPasscode}
        passcode={passcode}
        setPasscode={setPasscode}
        setScreen={setScreen}
      />
    ),
    [WalletOnboardingScreen.CONFIRM_PASSCODE]: (
      <ConfirmPasscodeScreen
        correctPasscode={passcode}
        checkPasscode={walletStore.checkPasscode}
        setScreen={setScreen}
        canContinue={canContinue}
        setCanContinue={setCanContinue}
      />
    ),
    [WalletOnboardingScreen.FINALIZING]: (
      <FinalizingScreen
        setScreen={setScreen}
        seedPhrase={seedPhrase}
        setSeedPhrase={setSeedPhrase}
        passcode={passcode}
        setPasscode={setPasscode}
      />
    ),
    [WalletOnboardingScreen.DETECTED_EXISTING]: (
      <DetectedExistingScreen setScreen={setScreen} />
    ),
    [WalletOnboardingScreen.RECOVER_EXISTING]: (
      <RecoverExistingScreen
        setSeedPhrase={(phrase: string, passcode: number[]) => {
          setSeedPhrase(phrase);
          setPasscode(passcode);
        }}
        setScreen={setScreen}
      />
    ),
  };

  if (loading.isOn) {
    return (
      <Flex flex={1} flexDirection="column" justifyContent="center">
        <Flex width="100%" flexDirection="column" alignItems="center">
          <Spinner size={3} />
        </Flex>
      </Flex>
    );
  }

  const currentComponent = components[screen];
  return currentComponent;
};

export const WalletOnboarding = observer(WalletOnboardingPresenter);
