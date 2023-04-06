import { AccountStatisticsDialog } from '@holium/shared';
import { Page } from '../../components/Page';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';
import { UserContextProvider, useUser } from '../../util/UserContext';

const StatisticsPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedPatp, setSelectedPatp } = useUser();

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  return (
    <Page title="Account / Statistics" isProtected>
      <AccountStatisticsDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        setSelectedPatp={setSelectedPatp}
        onClickSidebarSection={onClickSidebarSection}
        onExit={logout}
      />
    </Page>
  );
};

export default function Statistics() {
  return (
    <Page title="Account / Statistics" isProtected>
      <UserContextProvider>
        <StatisticsPresenter />
      </UserContextProvider>
    </Page>
  );
}
