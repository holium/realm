import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: MobXAccount;
};

export const AccountStorageSection = ({}: Props) => (
  <SettingSection title="S3 Storage" body="S3 Storage" />
);
