import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountCustomDomainSection } from './sections/AccountCustomDomainSection';
import { AccountHostingSection } from './sections/AccountHostingSection';
import { AccountPassportSection } from './sections/AccountPassportSection';
import { AccountStorageSection } from './sections/AccountStorageSection';

const AccountPanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  const isRealmShip = loggedInAccount.type === 'hosted';

  return (
    <SettingPane>
      <SettingTitle title="Account" />
      <AccountPassportSection
        account={loggedInAccount}
        key={`${loggedInAccount.patp}-settings-passport`}
      />
      {isRealmShip && (
        <>
          <AccountHostingSection
            account={loggedInAccount}
            key={`${loggedInAccount.patp}-settings-hosting`}
          />
          <AccountStorageSection
            account={loggedInAccount}
            key={`${loggedInAccount.patp}-settings-storage`}
          />
          <AccountCustomDomainSection
            account={loggedInAccount}
            key={`${loggedInAccount.patp}-custom-domain`}
          />
        </>
      )}
    </SettingPane>
  );
};

export const AccountPanel = observer(AccountPanelPresenter);
