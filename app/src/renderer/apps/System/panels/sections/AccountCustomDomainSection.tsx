import { AccountModelSnapshot } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: AccountModelSnapshot;
};

export const AccountCustomDomainSection = ({}: Props) => (
  <SettingSection title="Custom Domain" body="Custom Domain" />
);
