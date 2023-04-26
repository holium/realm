import { ShipMobxType } from 'renderer/stores/ship.store';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  ship: ShipMobxType;
};

export const AccountStorageSection = ({}: Props) => (
  <SettingSection title="S3 Storage" body="S3 Storage" />
);
