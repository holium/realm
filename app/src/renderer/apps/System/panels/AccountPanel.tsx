import { observer } from 'mobx-react';

import { UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountCustomDomainSection } from './sections/AccountCustomDomainSection';
import { AccountHostingSection } from './sections/AccountHostingSection';
import { AccountPassportSection } from './sections/AccountPassportSection';
import { AccountSelfHostingSection } from './sections/AccountSelfHostingSection';
import { AccountStorageSection } from './sections/AccountStorageSection';
import { MaybeLogin } from './sections/MaybeLogin';
import { ServerSelfHostingSection } from './sections/ServerSelfHostingSection';

const AccountPanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  const isRealmShip = loggedInAccount.serverType === 'hosted';

  return (
    <SettingPane>
      <SettingTitle title="Account" />
      <AccountPassportSection
        account={loggedInAccount}
        key={`${loggedInAccount.serverId}-settings-passport`}
      />
      {isRealmShip ? (
        <MaybeLogin>
          <UserContextProvider api={thirdEarthApi}>
            <AccountHostingSection
              account={loggedInAccount}
              key={`${loggedInAccount.serverId}-settings-hosting`}
            />
            <AccountStorageSection
              account={loggedInAccount}
              key={`${loggedInAccount.serverId}-settings-storage`}
            />
            <AccountCustomDomainSection
              account={loggedInAccount}
              key={`${loggedInAccount.serverId}-settings-custom-domain`}
            />
          </UserContextProvider>
        </MaybeLogin>
      ) : (
        <>
          <MaybeLogin>
            <UserContextProvider api={thirdEarthApi}>
              <AccountSelfHostingSection
                account={loggedInAccount}
                key={`${loggedInAccount.serverId}-settings-hosting-self-hosting`}
              />
            </UserContextProvider>
          </MaybeLogin>
          <ServerSelfHostingSection
            account={loggedInAccount}
            key={`${loggedInAccount.serverId}-settings-account-self-hosting`}
          />
        </>
      )}
    </SettingPane>
  );
};

export const AccountPanel = observer(AccountPanelPresenter);
