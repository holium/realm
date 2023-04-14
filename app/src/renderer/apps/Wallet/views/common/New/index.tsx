import { useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Flex, Button, Icon } from '@holium/design-system';
import { Create } from './Create';
import { Backup } from './Backup';
import { Import } from './Import';
import { Confirm } from './Confirm';
import { CreatePasscode } from './CreatePasscode';
import { ConfirmPasscode } from './ConfirmPasscode';
import { Finalizing } from './Finalizing';
import { DetectedExisting } from './DetectedExisting';
import { RecoverExisting } from './RecoverExisting';
import { useTrayApps } from 'renderer/apps/store';

export enum NewWalletScreen {
  CREATE = 'create',
  IMPORT = 'import',
  BACKUP = 'backup',
  CONFIRM = 'confirm',
  PASSCODE = 'passcode',
  CONFIRM_PASSCODE = 'confirm_passcode',
  FINALIZING = 'finalizing',
  DETECTED_EXISTING = 'detected_existing',
  RECOVER_EXISTING = 'recover_existing',
}

const EthNewPresenter = () => {
  const { walletApp, dimensions } = useTrayApps();
  const initialScreen = walletApp.initialized
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

  const components: any = {
    [NewWalletScreen.CREATE]: <Create setScreen={setScreen} />,
    [NewWalletScreen.IMPORT]: (
      <Import setSeedPhrase={setSeedPhrase} setScreen={setScreen} />
    ),
    [NewWalletScreen.BACKUP]: (
      <Backup
        setScreen={setScreen}
        setSeedPhrase={setSeedPhrase}
        seedPhrase={seedPhrase}
      />
    ),
    [NewWalletScreen.CONFIRM]: (
      <Confirm setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [NewWalletScreen.PASSCODE]: (
      <CreatePasscode setPasscode={setPasscodeWrapper} />
    ),
    [NewWalletScreen.CONFIRM_PASSCODE]: (
      <ConfirmPasscode
        setScreen={setScreen}
        correctPasscode={passcode}
        onSuccess={setPasscode}
      />
    ),
    [NewWalletScreen.FINALIZING]: (
      <Finalizing seedPhrase={seedPhrase} passcode={passcode} />
    ),
    [NewWalletScreen.DETECTED_EXISTING]: (
      <DetectedExisting setScreen={setScreen} />
    ),
    [NewWalletScreen.RECOVER_EXISTING]: (
      <RecoverExisting
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
    <Box width="100%" height="100%" px={1} py={2}>
      {currentComponent}
      {![NewWalletScreen.CREATE, NewWalletScreen.DETECTED_EXISTING].includes(
        screen
      ) && (
        <Flex
          position="absolute"
          top={dimensions.height - 54}
          zIndex={999}
          onClick={() =>
            setScreen(
              walletApp.initialized
                ? NewWalletScreen.DETECTED_EXISTING
                : NewWalletScreen.CREATE
            )
          }
        >
          <Button.IconButton
            onClick={() =>
              setScreen(
                walletApp.initialized
                  ? NewWalletScreen.DETECTED_EXISTING
                  : NewWalletScreen.CREATE
              )
            }
          >
            <Icon name="ArrowLeftLine" size={1} />
          </Button.IconButton>
        </Flex>
      )}
    </Box>
  );
};

export const EthNew = observer(EthNewPresenter);
