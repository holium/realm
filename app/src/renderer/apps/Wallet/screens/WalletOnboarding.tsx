import { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon } from '@holium/design-system/general';

import { WalletOnboardingScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { BackupScreen } from './BackupScreen';
import { ConfirmPasscodeScreen } from './ConfirmPasscodeScreen';
import { ConfirmScreen } from './ConfirmScreen';
import { CreatePasscodeScreen } from './CreatePasscodeScreen';
import { DetectedExistingScreen } from './DetectedExistingScreen';
import { FinalizingScreen } from './FinalizingScreen/FinalizingScreen';
import { ImportScreen } from './ImportScreen';
import { NoWalletFoundScreen } from './NoWalletFoundScreen';
import { RecoverExistingScreen } from './RecoverExistingScreen';

const WalletOnboardingPresenter = () => {
  const { walletStore } = useShipStore();
  const initialScreen = walletStore.initialized
    ? WalletOnboardingScreen.DETECTED_EXISTING
    : WalletOnboardingScreen.NO_WALLET;

  const [screen, setScreen] = useState<WalletOnboardingScreen>(initialScreen);
  const [passcode, setPasscode] = useState<number[]>([]);

  // TODO move this to background thread
  const [seedPhrase, setSeedPhrase] = useState('');

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
      />
    ),
    [WalletOnboardingScreen.FINALIZING]: (
      <FinalizingScreen seedPhrase={seedPhrase} passcode={passcode} />
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
