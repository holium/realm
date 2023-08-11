import { useMemo, useState } from 'react';

import { useToggle } from '@holium/design-system/util';
import {
  AccountCustomDomainDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { getSupportEmail } from 'util/constants';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const CustomDomainPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { token, ships, selectedShipId, setSelectedShipId } = useUser();

  const submitting = useToggle(false);
  const [domain, setDomain] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const ship = useMemo(
    () => ships.find((ship) => ship.id === selectedShipId),
    [ships, selectedShipId]
  );

  const onSubmit = async () => {
    if (!ship) return;
    if (!token) return;
    if (!domain) return;

    submitting.toggleOn();

    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    const result = await thirdEarthApi.setCustomDomain(
      token,
      domain,
      ship.droplet_id.toString(),
      ship.droplet_ip,
      ship.id.toString(),
      ship.user_id.toString()
    );

    if (result) {
      if (result.checkIp !== ship.droplet_id.toString()) {
        setErrorMessage(
          `The domain you entered does not point to the correct IP address (${ship.droplet_ip}).`
        );
      } else {
        setSuccessMessage(
          `Your domain has been set to ${domain}. It may take a few minutes to propagate.`
        );
      }
    }

    submitting.toggleOff();
  };

  const onClickSidebarSection = (section: string) => {
    if (section === 'Contact Support') {
      window.open(getSupportEmail(ship?.patp), '_blank');
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
        back_url: '/account/custom-domain',
      });
    } else {
      goToPage('/upload-id-disclaimer', {
        back_url: '/account/custom-domain',
      });
    }
  };

  const onClickPurchaseId = () => {
    goToPage('/choose-id', {
      back_url: '/account/custom-domain',
    });
  };

  return (
    <AccountCustomDomainDialog
      ships={ships}
      selectedShipId={selectedShipId}
      domain={domain}
      dropletIp={ship?.droplet_ip}
      errorMessage={errorMessage}
      successMessage={successMessage}
      submitting={submitting.isOn}
      setSelectedShipId={setSelectedShipId}
      onChangeDomain={setDomain}
      onSubmit={onSubmit}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadId={onClickUploadId}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
  );
};

export default function CustomDomain() {
  return (
    <Page title="Account / Custom domain" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <CustomDomainPresenter />
      </UserContextProvider>
    </Page>
  );
}
