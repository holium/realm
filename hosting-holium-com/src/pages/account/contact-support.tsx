import { useEffect, useState } from 'react';

import {
  AccountSupportDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const SupportPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedShipId, setSelectedShipId } = useUser();

  const [alerts, setAlerts] = useState<string[]>([]);

  const onClickSidebarSection = (section: string) => {
    if (section === 'Get Hosting') {
      goToPage(accountPageUrl[section], {
        back_url: '/account/contact-support',
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
        back_url: '/account/contact-support',
      });
    } else {
      goToPage('/upload-id-disclaimer', {
        back_url: '/account/contact-support',
      });
    }
  };

  const onClickPurchaseId = () => {
    goToPage('/choose-id', {
      back_url: '/account/contact-support',
    });
  };

  useEffect(() => {
    const getAndSetAlerts = async () => {
      const status = await thirdEarthApi.alerts();
      console.log('status', JSON.stringify(status, null, 2));
      setAlerts(status.alerts);
    };

    getAndSetAlerts();
  });

  return (
    <AccountSupportDialog
      alerts={alerts}
      ships={ships}
      selectedShipId={selectedShipId}
      setSelectedShipId={setSelectedShipId}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadId={onClickUploadId}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
  );
};

export default function AccountSupportPage() {
  return (
    <Page title="Account / Support" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <SupportPresenter />
      </UserContextProvider>
    </Page>
  );
}
