import { FC, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { ethers } from 'ethers';

import { Box } from 'renderer/components';
import { Create } from './Create';
import { Backup } from './Backup';
import { Confirm } from './Confirm';
import { Passcode } from './Passcode';
import { ConfirmPasscode } from './ConfirmPasscode';
import { Finalizing } from './Finalizing';

export enum NewWalletScreen {
  CREATE = 'create',
  BACKUP = 'backup',
  CONFIRM = 'confirm',
  PASSCODE = 'passcode',
  CONFIRM_PASSCODE = 'confirm_passcode',
  FINALIZING = 'finalizing',
}

export const EthNew: FC<any> = observer(() => {
  const [screen, setScreen] = useState<NewWalletScreen>(NewWalletScreen.CREATE);
  const [passcode, setPasscode] = useState('');
  // TODO move this to background thread
  const seedPhrase = useMemo(
    () => ethers.Wallet.createRandom().mnemonic.phrase,
    []
  );
  // const seedPhrase =
  //   'govern mountain flush ordinary field adult stereo quiz humor pigeon flush stuff';

  let setPasscodeWrapper = (passcode: string) => {
    // console.log('setting passcode!');
    setPasscode(passcode);
    setScreen(NewWalletScreen.CONFIRM_PASSCODE);
  };

  const components = {
    [NewWalletScreen.CREATE]: <Create setScreen={setScreen} />,
    [NewWalletScreen.BACKUP]: (
      <Backup setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [NewWalletScreen.CONFIRM]: (
      <Confirm setScreen={setScreen} seedPhrase={seedPhrase} />
    ),
    [NewWalletScreen.PASSCODE]: <Passcode setPasscode={setPasscodeWrapper} />,
    [NewWalletScreen.CONFIRM_PASSCODE]: (
      <ConfirmPasscode setScreen={setScreen} correctPasscode={passcode} />
    ),
    [NewWalletScreen.FINALIZING]: (
      <Finalizing seedPhrase={seedPhrase} passcode={passcode} />
    ),
  };
  const currentComponent = components[screen];

  return (
    <Box width="100%" height="100%" px={16} py={12}>
      {currentComponent}
    </Box>
  );
});
