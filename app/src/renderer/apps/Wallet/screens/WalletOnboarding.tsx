import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { useToggle } from '@holium/design-system';
import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { BackupScreen } from './BackupScreen';
import { ConfirmPasscodeScreen } from './ConfirmPasscodeScreen';
import { ConfirmScreen } from './ConfirmScreen';
import { CreatePasscodeScreen } from './CreatePasscodeScreen';
import { DetectedExistingScreen } from './DetectedExistingScreen';
import { FinalizingScreen } from './FinalizingScreen/FinalizingScreen';
import { ForgotPasscodeScreenBody } from './ForgotPasscodeScreen/ForgotPasscodeScreenBody';
import { ImportScreen } from './ImportScreen';
import { NoWalletFoundScreen } from './NoWalletFoundScreen';
import { RecoverExistingScreen } from './RecoverExistingScreen';

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
};

const WalletOnboardingPresenter = () => {
  const { walletStore } = useShipStore();
  const initialScreen = walletStore.initialized
    ? WalletOnboardingScreen.DETECTED_EXISTING
    : WalletOnboardingScreen.NO_WALLET;

  const loading = useToggle(true);
  const [screen, setScreen] = useState<WalletOnboardingScreen>(initialScreen);
  const [passcode, setPasscode] = useState<number[]>([]);

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
    if (screen !== WalletOnboardingScreen.CANCEL) {
      localStorage.setItem('WalletOnboardingScreen', screen);
    }
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('WalletOnboardingPasscode', JSON.stringify(passcode));
  }, [passcode]);

  useEffect(() => {
    localStorage.setItem('WalletOnboardingSeedPhrase', seedPhrase);
  }, [seedPhrase]);

  const setPasscodeWrapper = async (passcode: number[]) => {
    setPasscode(passcode);
    setScreen(WalletOnboardingScreen.CONFIRM_PASSCODE);
  };

  const onCorrectPasscode = async (passcode: number[]) => {
    setPasscode(passcode);
    setScreen(WalletOnboardingScreen.FINALIZING);
  };

  const components = {
    [WalletOnboardingScreen.NO_WALLET]: (
      <NoWalletFoundScreen setScreen={setScreen} />
    ),
    [WalletOnboardingScreen.IMPORT]: (
      <ImportScreen setSeedPhrase={setSeedPhrase} setScreen={setScreen} />
    ),
    [WalletOnboardingScreen.BACKUP]: (
      <BackupScreen
        setScreen={setScreen}
        setSeedPhrase={setSeedPhrase}
        seedPhrase={seedPhrase}
      />
    ),
    [WalletOnboardingScreen.CANCEL]: (
      <ForgotPasscodeScreenBody
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
        bodyText="Are you sure? To create a new wallet, a different seed phrase will be used."
      />
    ),
    [WalletOnboardingScreen.CONFIRM]: (
      <ConfirmScreen setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [WalletOnboardingScreen.PASSCODE]: (
      <CreatePasscodeScreen
        checkPasscode={walletStore.checkPasscode}
        setPasscode={setPasscodeWrapper}
      />
    ),
    [WalletOnboardingScreen.CONFIRM_PASSCODE]: (
      <ConfirmPasscodeScreen
        correctPasscode={passcode}
        checkPasscode={walletStore.checkPasscode}
        onSuccess={onCorrectPasscode}
        setScreen={setScreen}
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
  const currentComponent = components[screen];

  if (loading.isOn) {
    return (
      <Flex flex={1} flexDirection="column" justifyContent="center">
        <Flex width="100%" flexDirection="column" alignItems="center">
          <Spinner size={3} />
        </Flex>
      </Flex>
    );
  }

  return (
    <>
      {currentComponent}
      {![
        WalletOnboardingScreen.NO_WALLET,
        WalletOnboardingScreen.DETECTED_EXISTING,
      ].includes(screen) && (
        <Flex
          position="absolute"
          zIndex={999}
          onClick={() =>
            setScreen(
              walletStore.initialized
                ? WalletOnboardingScreen.DETECTED_EXISTING
                : WalletOnboardingScreen.NO_WALLET
            )
          }
        >
          <Button.IconButton
            onClick={() =>
              setScreen(
                walletStore.initialized
                  ? WalletOnboardingScreen.DETECTED_EXISTING
                  : WalletOnboardingScreen.NO_WALLET
              )
            }
          >
            <Icon name="ArrowLeftLine" size={1} />
          </Button.IconButton>
        </Flex>
      )}
    </>
  );
};

export const WalletOnboarding = observer(WalletOnboardingPresenter);
