import { AccountModelSnapshot } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: AccountModelSnapshot;
};

export const AccountStorageSection = ({}: Props) => (
  <SettingSection title="S3 Storage" body="S3 Storage" />
);
