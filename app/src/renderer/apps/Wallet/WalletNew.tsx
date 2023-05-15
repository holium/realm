import { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon } from '@holium/design-system/general';

import { NewWalletScreen } from 'renderer/apps/Wallet/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { BackupScreen } from './screens/BackupScreen';
import { ConfirmPasscodeScreen } from './screens/ConfirmPasscodeScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { CreateOrImportScreen } from './screens/CreateOrImportScreen';
import { CreatePasscodeScreen } from './screens/CreatePasscodeScreen';
import { DetectedExistingScreen } from './screens/DetectedExistingScreen';
import { FinalizingScreen } from './screens/FinalizingScreen';
import { ImportScreen } from './screens/ImportScreen';
import { RecoverExistingScreen } from './screens/RecoverExistingScreen';

const WalletNewPresenter = () => {
  const { walletStore } = useShipStore();
  const initialScreen = walletStore.initialized
    ? NewWalletScreen.DETECTED_EXISTING
    : NewWalletScreen.CREATE;

  const [screen, setScreen] = useState<NewWalletScreen>(initialScreen);
  const [passcode, setPasscode] = useState<number[]>([]);

  // TODO move this to background thread
  const [seedPhrase, setSeedPhrase] = useState('');

  const setPasscodeWrapper = (passcode: number[]) => {
    setPasscode(passcode);
    setScreen(NewWalletScreen.CONFIRM_PASSCODE);
  };

  const components = {
    [NewWalletScreen.CREATE]: <CreateOrImportScreen setScreen={setScreen} />,
    [NewWalletScreen.IMPORT]: (
      <ImportScreen setSeedPhrase={setSeedPhrase} setScreen={setScreen} />
    ),
    [NewWalletScreen.BACKUP]: (
      <BackupScreen
        setScreen={setScreen}
        setSeedPhrase={setSeedPhrase}
        seedPhrase={seedPhrase}
      />
    ),
    [NewWalletScreen.CONFIRM]: (
      <ConfirmScreen setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [NewWalletScreen.PASSCODE]: (
      <CreatePasscodeScreen setPasscode={setPasscodeWrapper} />
    ),
    [NewWalletScreen.CONFIRM_PASSCODE]: (
      <ConfirmPasscodeScreen
        setScreen={setScreen}
        correctPasscode={passcode}
        onSuccess={setPasscode}
      />
    ),
    [NewWalletScreen.FINALIZING]: (
      <FinalizingScreen seedPhrase={seedPhrase} passcode={passcode} />
    ),
    [NewWalletScreen.DETECTED_EXISTING]: (
      <DetectedExistingScreen setScreen={setScreen} />
    ),
    [NewWalletScreen.RECOVER_EXISTING]: (
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
      {![NewWalletScreen.CREATE, NewWalletScreen.DETECTED_EXISTING].includes(
        screen
      ) && (
        <Flex
          position="absolute"
          zIndex={999}
          onClick={() =>
            setScreen(
              walletStore.initialized
                ? NewWalletScreen.DETECTED_EXISTING
                : NewWalletScreen.CREATE
            )
          }
        >
          <Button.IconButton
            onClick={() =>
              setScreen(
                walletStore.initialized
                  ? NewWalletScreen.DETECTED_EXISTING
                  : NewWalletScreen.CREATE
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

export const WalletNew = observer(WalletNewPresenter);
