import { FC, useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Flex, Icons, IconButton } from 'renderer/components';
import { Create } from './Create';
import { Backup } from './Backup';
import { Import } from './Import';
import { Confirm } from './Confirm';
import { CreatePasscode } from './CreatePasscode';
import { ConfirmPasscode } from './ConfirmPasscode';
import { Finalizing } from './Finalizing';
import DetectedExisting from './DetectedExisting';
import { RecoverExisting } from './RecoverExisting';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';

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

export const EthNew: FC<any> = observer(() => {
  const { theme } = useServices();
  const { walletApp } = useTrayApps();
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
      <ConfirmPasscode setScreen={setScreen} correctPasscode={passcode} onSuccess={setPasscode} />
    ),
    [NewWalletScreen.FINALIZING]: (
      <Finalizing seedPhrase={seedPhrase} passcode={passcode} />
    ),
    [NewWalletScreen.DETECTED_EXISTING]: (
      <DetectedExisting setScreen={setScreen} />
    ),
    [NewWalletScreen.RECOVER_EXISTING]: (
      <RecoverExisting setSeedPhrase={(phrase: string, passcode: number[]) => {
        setSeedPhrase(phrase);
        setPasscode(passcode);
      }} setScreen={setScreen} />
    ),
  };
  const currentComponent = components[screen];

  return (
    <Box width="100%" height="100%" px={16} py={12}>
      {currentComponent}
      {![NewWalletScreen.CREATE, NewWalletScreen.DETECTED_EXISTING].includes(
        screen
      ) && (
        <Flex
          position="absolute"
          top="582px"
          zIndex={999}
          onClick={() =>
            setScreen(
              walletApp.initialized
                ? NewWalletScreen.DETECTED_EXISTING
                : NewWalletScreen.CREATE
            )
          }
        >
          <IconButton
            onClick={() =>
              setScreen(
                walletApp.initialized
                  ? NewWalletScreen.DETECTED_EXISTING
                  : NewWalletScreen.CREATE
              )
            }
          >
            <Icons
              name="ArrowLeftLine"
              size={1}
              color={theme.currentTheme.iconColor}
            />
          </IconButton>
        </Flex>
      )}
    </Box>
  );
});
