import {
  AccountDownloadRealmDialog,
  OnboardingStorage,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { downloadLinks } from '../../util/constants';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const DownloadRealmPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedIdentity, setSelectedIdentity } = useUser();

  const onClickSidebarSection = (section: string) => {
    if (section === 'Get Hosting') {
      goToPage(accountPageUrl[section], {
        back_url: '/account/download-realm',
      });
    }
    goToPage(accountPageUrl[section]);
  };

  const onClickUploadId = () => {
    OnboardingStorage.set({
      productType: 'byop-p',
    });
    goToPage('/payment', {
      back_url: '/account/get-realm',
    });
  };

  const onClickPurchaseId = () => {
    OnboardingStorage.remove('productType');
    goToPage('/choose-id', {
      back_url: '/account/download-realm',
    });
  };

  const onDownloadMacM1 = () => window.open(downloadLinks.macM1, '_blank');

  const onDownloadMacIntel = () =>
    window.open(downloadLinks.macIntel, '_blank');

  const onDownloadWindows = () => window.open(downloadLinks.windows, '_blank');

  const onDownloadLinux = () => window.open(downloadLinks.linux, '_blank');

  return (
    <Page title="Account / Download Realm" isProtected>
      <AccountDownloadRealmDialog
        identities={ships.map((ship) => ship.patp)}
        selectedIdentity={selectedIdentity}
        setSelectedIdentity={setSelectedIdentity}
        onDownloadMacM1={onDownloadMacM1}
        onDownloadMacIntel={onDownloadMacIntel}
        onDownloadWindows={onDownloadWindows}
        onDownloadLinux={onDownloadLinux}
        onClickPurchaseId={onClickPurchaseId}
        onClickUploadId={onClickUploadId}
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
