import { AccountDownloadRealmDialog } from '@holium/shared';
import { useUser, UserContextProvider } from 'util/UserContext';
import { Page } from '../../components/Page';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const DownloadRealmPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedPatp, setSelectedPatp } = useUser();

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  return (
    <Page title="Account / Download Realm" isProtected>
      <AccountDownloadRealmDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        setSelectedPatp={setSelectedPatp}
        onDownloadMacM1={() => {}}
        onDownloadMacIntel={() => {}}
        onDownloadWindows={() => {}}
        onDownloadLinux={() => {}}
        onClickSidebarSection={onClickSidebarSection}
        onExit={logout}
      />
    </Page>
  );
};

export default function DownloadRealm() {
  return (
    <Page title="Account / Download Realm" isProtected>
      <UserContextProvider>
        <DownloadRealmPresenter />
      </UserContextProvider>
    </Page>
  );
}
