import { FC, useState, useMemo } from 'react';
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

export enum NewWalletScreen {
  CREATE = 'create',
  IMPORT = 'import',
  BACKUP = 'backup',
  CONFIRM = 'confirm',
  PASSCODE = 'passcode',
  CONFIRM_PASSCODE = 'confirm_passcode',
  FINALIZING = 'finalizing',
}

export const EthNew: FC<any> = observer(() => {
  const [screen, setScreen] = useState<NewWalletScreen>(NewWalletScreen.CREATE);
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
  };
  const currentComponent = components[screen as NewWalletScreen];

  return (
    <Box width="100%" height="100%" px={16} py={12}>
      {currentComponent}
    </Box>
  );
});
