import { useEffect, useState } from 'react';

import { ServerSelfHostingDialogBody } from '@holium/shared';

import { ShipIPC } from 'renderer/stores/ipc';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: MobXAccount;
};

export const ServerSelfHostingSection = ({ account }: Props) => {
  const [serverCode, setServerCode] = useState('');
  useEffect(() => {
    ShipIPC.getServerCode().then((code) => {
      if (code) {
        setServerCode(code);
      }
    });
  }, []);

  return (
    <SettingSection
      title="Server"
      body={
        <ServerSelfHostingDialogBody
          serverId={account.serverId}
          serverUrl={account.serverUrl}
          serverCode={serverCode}
        />
      }
    />
  );
};
