import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { SettingPane } from '../components/SettingPane';
import { SettingTitle } from '../components/SettingTitle';
import { AccountPassportSection } from './sections/AccountPassportSection';

const PassportPanelPresenter = () => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <SettingPane>
      <SettingTitle title="Passport" />
      <AccountPassportSection
        account={loggedInAccount}
        key={`${loggedInAccount.serverId}-settings-passport`}
      />
    </SettingPane>
  );
};

export const PassportPanel = observer(PassportPanelPresenter);
