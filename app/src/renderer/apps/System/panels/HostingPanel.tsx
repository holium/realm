import { observer } from 'mobx-react';

import { UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountHostingSection } from './sections/AccountHostingSection';
import { MaybeLogin } from './sections/MaybeLogin';

const HostingPanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <SettingPane>
      <SettingTitle title="Hosting" />
      <MaybeLogin>
        <UserContextProvider api={thirdEarthApi}>
          <AccountHostingSection
            account={loggedInAccount}
            key={`${loggedInAccount.serverId}-settings-hosting`}
          />
        </UserContextProvider>
      </MaybeLogin>
    </SettingPane>
  );
};

export const HostingPanel = observer(HostingPanelPresenter);
