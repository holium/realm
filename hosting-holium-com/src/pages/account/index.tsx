import { useEffect, useMemo } from 'react';

import { useToggle } from '@holium/design-system/util';
import {
  AccountHostingDialog,
  ChangeEmailModal,
  ChangeMaintenanceWindowModal,
  ChangePasswordModal,
  EjectIdModal,
  GetNewAccessCodeModal,
  OnboardingStorage,
  UserContextProvider,
  useUser,
  VerifyEmailModal,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const HostingPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const {
    token,
    email,
    ships,
    selectedIdentity,
    setSelectedIdentity,
    refetchShips,
  } = useUser();

  const changeEmailModal = useToggle(false);
  const verifyEmailModal = useToggle(false);
  const changePasswordModal = useToggle(false);
  const getNewAccessCodeModal = useToggle(false);
  const changeMaintenanceWindowModal = useToggle(false);
  const ejectIdModal = useToggle(false);

  const identities = useMemo(
    () => ships.map((ship) => ship.patp || ship.title),
    [ships]
  );
  const selectedShip = useMemo(
    () => ships.find((ship) => ship.patp === selectedIdentity) || ships[0],
    [ships, selectedIdentity]
  );

  const isUploadedIdentity = useMemo(
    () => selectedShip?.product_type === 'byop-p',
    [selectedShip]
  );

  useEffect(() => {
    // if there are no ships and the only one is a BYOP-P, go to upload-id
    if (
      isUploadedIdentity &&
      ships.length === 1 &&
      selectedShip.ship_type !== 'planet'
    ) {
      OnboardingStorage.set({
        productType: 'byop-p',
        provisionalShipId: selectedShip.id.toString(),
      });
      goToPage('/upload-id', {
        back_url: '/account',
      });
    }
  }, [isUploadedIdentity, ships]);

  const setSelectedShipOrRedirect = (ship: string) => {
    const shipToSelect = ships.find((teShip) => teShip.patp === ship);
    if (
      shipToSelect?.product_type === 'byop-p' &&
      shipToSelect.ship_type !== 'planet'
    ) {
      OnboardingStorage.set({
        productType: 'byop-p',
        provisionalShipId: shipToSelect.id.toString(),
      });
      goToPage('/upload-id', {
        back_url: '/account',
      });
      return;
    }
    if (ship === selectedIdentity) return;
    setSelectedIdentity(ship);
  };

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  const onSubmitNewEmail = async (email: string) => {
    if (!token) return Promise.resolve(false);
    try {
      const response = await thirdEarthApi.changeEmail(token, email);

      if (response.email) {
        changeEmailModal.toggleOff();
        verifyEmailModal.toggleOn();
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  const onSubmitVerificationToken = async (
    verificationToken: string,
    password: string
  ) => {
    try {
      const response = await thirdEarthApi.verifyEmail(
        verificationToken,
        password
      );

      if (response.token) {
        window.location.reload();
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  const onSubmitNewPassword = async (password: string) => {
    if (!token) return Promise.resolve(false);
    try {
      const response = await thirdEarthApi.changePassword(token, password);

      if (response?.token) {
        changePasswordModal.toggleOff();
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  const onSubmitNewAccessCode = async () => {
    if (!token) return Promise.resolve(false);
    if (!selectedShip) return Promise.resolve(false);

    const response = await thirdEarthApi.resetShipCode(
      token,
      selectedShip.id.toString()
    );

    if (response) return true;
    return false;
  };

  const onSubmitNewMaintenanceWindow = async (maintenanceWindow: string) => {
    if (!token) return Promise.resolve(false);
    if (!selectedShip) return Promise.resolve(false);

    const response = await thirdEarthApi.updateMaintenanceWindow(
      token,
      selectedShip.id.toString(),
      maintenanceWindow
    );

    if (response?.maintenance_window) {
      await refetchShips();

      changeMaintenanceWindowModal.toggleOff();

      return true;
    }

    return false;
  };

  const onClickManageBilling = async () => {
    if (!token) return false;

    const tokenResponse = await thirdEarthApi.refreshToken(token);

    if (tokenResponse) {
      OnboardingStorage.set({
        email: tokenResponse.email,
        token: tokenResponse.token,
      });
      const linkResponse = await thirdEarthApi.getManagePaymentLink(
        tokenResponse.token
      );

      if (linkResponse.url) {
        window.open(linkResponse.url, '_blank');
        return true;
      }
    }

    return false;
  };

  const onSubmitEjectId = async (ejectAddress: string, ethAddress: string) => {
    if (!token) return Promise.resolve(false);
    if (!selectedShip) return Promise.resolve(false);

    const response = await thirdEarthApi.ejectShip(
      token,
      selectedShip.id.toString(),
      ejectAddress,
      ethAddress
    );

    if (response) return true;

    return false;
  };

  const onClickUploadId = () => {
    OnboardingStorage.set({
      productType: 'byop-p',
    });
    goToPage('/payment', {
      back_url: '/account',
    });
  };

  const onClickPurchaseId = () => {
    OnboardingStorage.remove('productType');
    goToPage('/choose-id', {
      back_url: '/account',
    });
  };

  return (
    <Page title="Account / Hosting" isProtected>
      <ChangeEmailModal
        isOpen={changeEmailModal.isOn}
        onDismiss={changeEmailModal.toggleOff}
        onSubmit={onSubmitNewEmail}
      />
      <VerifyEmailModal
        isOpen={verifyEmailModal.isOn}
        onDismiss={verifyEmailModal.toggleOff}
        onSubmit={onSubmitVerificationToken}
      />
      <GetNewAccessCodeModal
        isOpen={getNewAccessCodeModal.isOn}
        onDismiss={getNewAccessCodeModal.toggleOff}
        onSubmit={onSubmitNewAccessCode}
      />
      <ChangePasswordModal
        isOpen={changePasswordModal.isOn}
        onDismiss={changePasswordModal.toggleOff}
        onSubmit={onSubmitNewPassword}
      />
      <ChangeMaintenanceWindowModal
        isOpen={changeMaintenanceWindowModal.isOn}
        initialSelected={(selectedShip?.maintenance_window ?? 0).toString()}
        onDismiss={changeMaintenanceWindowModal.toggleOff}
        onSubmit={onSubmitNewMaintenanceWindow}
      />
      <EjectIdModal
        isOpen={ejectIdModal.isOn}
        onDismiss={ejectIdModal.toggleOff}
        onSubmit={onSubmitEjectId}
      />
      <AccountHostingDialog
        identities={identities}
        selectedIdentity={selectedIdentity}
        isUploadedIdentity={isUploadedIdentity}
        ships={ships}
        email={email}
        serverUrl={selectedShip?.link}
        serverCode={selectedShip?.code}
        serverMaintenanceWindow={selectedShip?.maintenance_window}
        onClickPurchaseId={onClickPurchaseId}
        onClickUploadId={onClickUploadId}
        setSelectedIdentity={setSelectedShipOrRedirect}
        onClickChangeEmail={changeEmailModal.toggleOn}
        onClickChangePassword={changePasswordModal.toggleOn}
        onClickManageBilling={onClickManageBilling}
        onClickGetNewAccessCode={getNewAccessCodeModal.toggleOn}
        onClickChangeMaintenanceWindow={changeMaintenanceWindowModal.toggleOn}
        onClickEjectId={ejectIdModal.toggleOn}
        onClickSidebarSection={onClickSidebarSection}
        onExit={logout}
      />
    </Page>
  );
};

export default function Hosting() {
  return (
    <Page title="Account / Hosting" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <HostingPresenter />
      </UserContextProvider>
    </Page>
  );
}
