import {
  AccountDownloadRealmDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { thirdEarthApi } from 'util/thirdEarthApi';

import { Page } from '../../components/Page';
import { downloadLinks } from '../../util/constants';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

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
      <UserContextProvider api={thirdEarthApi}>
        <DownloadRealmPresenter />
      </UserContextProvider>
    </Page>
  );
}
