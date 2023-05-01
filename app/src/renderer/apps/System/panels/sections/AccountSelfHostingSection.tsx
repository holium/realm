import { AccountSelfHostingDialogBody } from '@holium/shared';

import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: MobXAccount;
};

export const AccountSelfHostingSection = ({ account }: Props) => (
  <SettingSection
    title="Server"
    body={
      <AccountSelfHostingDialogBody patp={account.patp} url={account.url} />
    }
  />
);
