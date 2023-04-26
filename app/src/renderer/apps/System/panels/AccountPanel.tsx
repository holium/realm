import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountCustomDomainSection } from './sections/AccountCustomDomainSection';
import { AccountHostingSection } from './sections/AccountHostingSection';
import { AccountPassportSection } from './sections/AccountPassportSection';
import { AccountStorageSection } from './sections/AccountStorageSection';

const AccountPanelPresenter = () => {
  const { ship } = useShipStore();

  if (!ship) return null;

  return (
    <SettingPane>
      <SettingTitle title="Account" />
      <AccountPassportSection
        ship={ship}
        key={`${ship.patp}-settings-passport`}
      />
      <AccountHostingSection
        ship={ship}
        key={`${ship.patp}-settings-hosting`}
      />
      <AccountStorageSection
        ship={ship}
        key={`${ship.patp}-settings-storage`}
      />
      <AccountCustomDomainSection
        ship={ship}
        key={`${ship.patp}-custom-domain`}
      />
    </SettingPane>
  );
};

export const AccountPanel = observer(AccountPanelPresenter);
