import { ShipMobxType } from 'renderer/stores/ship.store';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  ship: ShipMobxType;
};

export const AccountCustomDomainSection = ({}: Props) => (
  <SettingSection title="Custom Domain" body="Custom Domain" />
);
