import { ServerSelfHostingDialogBody } from '@holium/shared';

import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: MobXAccount;
};

export const ServerSelfHostingSection = ({ account }: Props) => (
  <SettingSection
    title="Server"
    body={
      <ServerSelfHostingDialogBody
        serverId={account.serverId}
        serverUrl={account.serverUrl}
        serverCode={account.serverCode}
      />
    }
  />
);
