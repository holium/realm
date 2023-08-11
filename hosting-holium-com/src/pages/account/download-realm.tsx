import {
  AccountDownloadRealmDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { downloadLinks, getSupportEmail } from '../../util/constants';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const DownloadRealmPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedShipId, setSelectedShipId } = useUser();

  const onClickSidebarSection = (section: string) => {
    if (section === 'Contact Support') {
      const ship = ships.find((ship) => ship.id === selectedShipId);
      window.open(getSupportEmail(ship?.patp ?? ''), '_blank');
    } else if (section === 'Get Hosting') {
      goToPage(accountPageUrl[section], {
        back_url: '/account/download-realm',
      });
    } else {
      goToPage(accountPageUrl[section]);
    }
  };

  const onClickUploadId = () => {
    const byopInProgress = ships.find(
      (ship) => ship.product_type === 'byop-p' && ship.ship_type !== 'planet'
    );

    if (byopInProgress) {
      goToPage('/upload-id', {
        back_url: '/account/download-realm',
      });
    } else {
      goToPage('/upload-id-disclaimer', {
        back_url: '/account/download-realm',
      });
    }
  };

  const onClickPurchaseId = () => {
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
    <AccountDownloadRealmDialog
      ships={ships}
      selectedShipId={selectedShipId}
      setSelectedShipId={setSelectedShipId}
      onDownloadMacM1={onDownloadMacM1}
      onDownloadMacIntel={onDownloadMacIntel}
      onDownloadWindows={onDownloadWindows}
      onDownloadLinux={onDownloadLinux}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadId={onClickUploadId}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
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
