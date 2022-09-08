import { FC, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { ethers } from 'ethers';

import { Box } from 'renderer/components';
import { Create } from './Create';
import { Backup } from './Backup';
import { Confirm } from './Confirm';
import { Passcode } from './Passcode';
import { Finalizing } from './Finalizing';

export enum NewWalletScreen {
  CREATE = 'create',
  BACKUP = 'backup',
  CONFIRM = 'confirm',
  PASSCODE = 'passcode',
  CONFIRM_PASSCODE = 'confirm_passcode',
  FINALIZING = 'finalizing'
}

const components = {
  [NewWalletScreen.CREATE]: Create,
  [NewWalletScreen.BACKUP]: Backup,
  [NewWalletScreen.CONFIRM]: Confirm,
  [NewWalletScreen.PASSCODE]: Passcode,
  [NewWalletScreen.CONFIRM_PASSCODE]: Passcode,
  [NewWalletScreen.FINALIZING]: Finalizing
}

export const EthNew: FC<any> = observer((props: any) => {
  const [screen, setScreen] = useState<NewWalletScreen>(NewWalletScreen.CONFIRM_PASSCODE);
  let Component = components[screen];

  const seedPhrase = useMemo(() => ethers.Wallet.createRandom().mnemonic.phrase, []);

  return (
    <Box width="100%" height="100%" px={16} py={12}>
      <Component {...props} setScreen={setScreen} seedPhrase={seedPhrase} />
    </Box>
  )
});
