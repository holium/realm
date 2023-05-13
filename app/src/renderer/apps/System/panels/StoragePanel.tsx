import { observer } from 'mobx-react';

import { UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountStorageSection } from './sections/AccountStorageSection';
import { MaybeLogin } from './sections/MaybeLogin';

const StoragePanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <SettingPane>
      <SettingTitle title="Storage" />
      <MaybeLogin>
        <UserContextProvider api={thirdEarthApi}>
          <AccountStorageSection
            account={loggedInAccount}
            key={`${loggedInAccount.serverId}-settings-storage`}
          />
        </UserContextProvider>
      </MaybeLogin>
    </SettingPane>
  );
};

export const StoragePanel = observer(StoragePanelPresenter);
