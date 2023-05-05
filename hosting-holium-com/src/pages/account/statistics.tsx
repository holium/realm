import {
  AccountStatisticsDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { thirdEarthApi } from 'util/thirdEarthApi';

import { Page } from '../../components/Page';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const StatisticsPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedPatp, setSelectedPatp } = useUser();

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  const onClickBuyServer = () => {
    goToPage(accountPageUrl['Get Hosting'], {
      back_url: accountPageUrl['Statistics'],
    });
  };

  return (
    <Page title="Account / Statistics" isProtected>
      <AccountStatisticsDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        setSelectedPatp={setSelectedPatp}
        onClickBuyServer={onClickBuyServer}
        onClickSidebarSection={onClickSidebarSection}
        onExit={logout}
      />
    </Page>
  );
};

export default function Statistics() {
  return (
    <Page title="Account / Statistics" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <StatisticsPresenter />
      </UserContextProvider>
    </Page>
  );
}
