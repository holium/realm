import { observer } from 'mobx-react';

import { UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountCustomDomainSection } from './sections/AccountCustomDomainSection';
import { MaybeLogin } from './sections/MaybeLogin';

const CustomDomainPanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <SettingPane>
      <SettingTitle title="Custom Domain" />
      <MaybeLogin>
        <UserContextProvider api={thirdEarthApi}>
          <AccountCustomDomainSection
            account={loggedInAccount}
            key={`${loggedInAccount.serverId}-settings-custom-domain`}
          />
        </UserContextProvider>
      </MaybeLogin>
    </SettingPane>
  );
};

export const CustomDomainPanel = observer(CustomDomainPanelPresenter);
