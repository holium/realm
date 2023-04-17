import { AccountDownloadRealmDialog } from '@holium/shared';
import { useUser, UserContextProvider } from 'util/UserContext';
import { Page } from '../../components/Page';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';
import { downloadLinks } from '../../util/constants';

const DownloadRealmPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedPatp, setSelectedPatp } = useUser();

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  const onDownloadMacM1 = () => window.open(downloadLinks.macM1, '_blank');

  const onDownloadMacIntel = () =>
    window.open(downloadLinks.macIntel, '_blank');

  const onDownloadWindows = () => window.open(downloadLinks.windows, '_blank');

  const onDownloadLinux = () => window.open(downloadLinks.linux, '_blank');

  return (
    <Page title="Account / Download Realm" isProtected>
      <AccountDownloadRealmDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        setSelectedPatp={setSelectedPatp}
        onDownloadMacM1={onDownloadMacM1}
        onDownloadMacIntel={onDownloadMacIntel}
        onDownloadWindows={onDownloadWindows}
        onDownloadLinux={onDownloadLinux}
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
