import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { ethers } from 'ethers';

import { Box } from 'renderer/components';
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
  const { walletApp } = useTrayApps();
  let initialScreen = walletApp.initialized ? NewWalletScreen.DETECTED_EXISTING : NewWalletScreen.CREATE;

  const [screen, setScreen] = useState<NewWalletScreen>(initialScreen);
  const [passcode, setPasscode] = useState<number[]>([]);

  // TODO move this to background thread
  const [seedPhrase, setSeedPhrase] = useState(
    ethers.Wallet.createRandom().mnemonic.phrase
  );
  let phraseSetter = (phrase: string) => setSeedPhrase(phrase);

  let setPasscodeWrapper = (passcode: number[]) => {
    setPasscode(passcode);
    setScreen(NewWalletScreen.CONFIRM_PASSCODE);
  };

  const components: any = {
    [NewWalletScreen.CREATE]: <Create setScreen={setScreen} />,
    [NewWalletScreen.IMPORT]: (
      <Import setSeedPhrase={phraseSetter} setScreen={setScreen} />
    ),
    [NewWalletScreen.BACKUP]: (
      <Backup setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [NewWalletScreen.CONFIRM]: (
      <Confirm setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [NewWalletScreen.PASSCODE]: (
      <CreatePasscode setPasscode={setPasscodeWrapper} />
    ),
    [NewWalletScreen.CONFIRM_PASSCODE]: (
      <ConfirmPasscode setScreen={setScreen} correctPasscode={passcode} />
    ),
    [NewWalletScreen.FINALIZING]: (
      <Finalizing seedPhrase={seedPhrase} passcode={passcode} />
    ),
    [NewWalletScreen.DETECTED_EXISTING]: (
      <DetectedExisting setScreen={setScreen} />
    ),
    [NewWalletScreen.RECOVER_EXISTING]: (
      <RecoverExisting setSeedPhrase={phraseSetter} setScreen={setScreen} />
    )
  };
  const currentComponent = components[screen as NewWalletScreen];

  return (
    <Box width="100%" height="100%" px={16} py={12}>
      {currentComponent}
    </Box>
  );
});
