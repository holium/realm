import { observer } from 'mobx-react';

import { UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountPassportSection } from './sections/AccountPassportSection';
import { AccountSelfHostingSection } from './sections/AccountSelfHostingSection';
import { MaybeLogin } from './sections/MaybeLogin';
import { ServerSelfHostingSection } from './sections/ServerSelfHostingSection';

const SelfHostingAccountPanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <SettingPane>
      <SettingTitle title="Account" />
      <AccountPassportSection
        account={loggedInAccount}
        key={`${loggedInAccount.serverId}-settings-passport`}
      />
      <MaybeLogin>
        <UserContextProvider api={thirdEarthApi}>
          <AccountSelfHostingSection
            key={`${loggedInAccount.serverId}-settings-hosting-self-hosting`}
          />
        </UserContextProvider>
      </MaybeLogin>
      <ServerSelfHostingSection
        account={loggedInAccount}
        key={`${loggedInAccount.serverId}-settings-account-self-hosting`}
      />
    </SettingPane>
  );
};

export const SelfHostingAccountPanel = observer(
  SelfHostingAccountPanelPresenter
);
