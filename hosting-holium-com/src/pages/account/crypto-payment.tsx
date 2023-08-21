import {
  AccountCryptoPaymentDialog,
  getSupportMailTo,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const CryptoPaymentPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedShipId, setSelectedShipId } = useUser();

  const onClickSidebarSection = (section: string) => {
    if (section === 'Contact Support') {
      const ship = ships.find((ship) => ship.id === selectedShipId);
      window.open(getSupportMailTo(ship?.patp, 'HOSTING issue'), '_blank');
    } else if (section === 'Get Hosting') {
      goToPage(accountPageUrl[section], {
        back_url: '/account/download-realm',
      });
    } else {
      goToPage(accountPageUrl[section]);
    }
  };

  const onClickUploadId = () => {
    goToPage('/upload-id-disclaimer', {
      back_url: '/account/download-realm',
    });
  };

  const onClickPurchaseId = () => {
    goToPage('/choose-id', {
      back_url: '/account/download-realm',
    });
  };

  return (
    <AccountCryptoPaymentDialog
      ships={ships}
      selectedShipId={selectedShipId}
      paymentHistory={[]}
      setSelectedShipId={setSelectedShipId}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadId={onClickUploadId}
      onClickSidebarSection={onClickSidebarSection}
      onClickPay={logout}
      onClickExit={logout}
    />
  );
};

export default function CryptoPayment() {
  return (
    <Page title="Account / Crypto Payment" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <CryptoPaymentPresenter />
      </UserContextProvider>
    </Page>
  );
}
