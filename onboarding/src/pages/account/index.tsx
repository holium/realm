import { useEffect, useState, useMemo } from 'react';
import {
  AccountHostingDialog,
  ChangeEmailModal,
  ChangeMaintenanceWindowModal,
  VerifyEmailModal,
  GetNewAccessCodeModal,
  ChangePasswordModal,
  EjectIdModal,
} from '@holium/shared';
import { useToggle } from '@holium/design-system';
import { Page } from '../../components/Page';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';
import { api } from '../../util/api';
import { UserContextProvider, useUser } from '../../util/UserContext';

const HostingPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { token, email, ships, selectedPatp, setSelectedPatp } = useUser();

  const changeEmailModal = useToggle(false);
  const verifyEmailModal = useToggle(false);
  const changePasswordModal = useToggle(false);
  const getNewAccessCodeModal = useToggle(false);
  const changeMaintenanceWindowModal = useToggle(false);
  const ejectIdModal = useToggle(false);

  const selectedShip = useMemo(
    () => ships.find((ship) => ship.patp === selectedPatp),
    [ships, selectedPatp]
  );

  const [managePaymentLink, setManagePaymentLink] = useState<string>('');

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  const onSubmitNewEmail = async (email: string) => {
    try {
      const response = await api.changeEmail(token, email);

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
      const response = await api.verifyEmail(verificationToken, password);

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
    try {
      const response = await api.changePassword(token, password);

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
    if (!selectedShip) return Promise.resolve(false);

    const response = await api.resetShipCode(token, selectedShip.id.toString());

    if (response) return true;
    return false;
  };

  const onSubmitNewMaintenanceWindow = async (maintenanceWindow: string) => {
    if (!selectedShip) return Promise.resolve(false);

    const response = await api.updateMaintenanceWindow(
      token,
      selectedShip.id.toString(),
      maintenanceWindow
    );

    if (response?.maintenance_window) return true;
    return false;
  };

  const onClickManageBilling = () => {
    window.open(managePaymentLink, '_blank');
  };

  const onSubmitEjectId = async (ejectAddress: string, ethAddress: string) => {
    if (!selectedShip) return Promise.resolve(false);

    const response = await api.ejectShip(
      token,
      selectedShip.id.toString(),
      ejectAddress,
      ethAddress
    );

    if (response) return true;

    return false;
  };

  useEffect(() => {
    api
      .getManagePaymentLink(token)
      .then((response) => setManagePaymentLink(response.url));
  }, []);

  if (!selectedShip) return null;

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
        initialSelected={selectedShip.maintenance_window.toString()}
        onDismiss={changeMaintenanceWindowModal.toggleOff}
        onSubmit={onSubmitNewMaintenanceWindow}
      />
      <EjectIdModal
        isOpen={ejectIdModal.isOn}
        onDismiss={ejectIdModal.toggleOff}
        onSubmit={onSubmitEjectId}
      />
      <AccountHostingDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        email={email}
        shipUrl={selectedShip.link}
        shipCode={selectedShip.code}
        shipMaintenanceWindow={selectedShip.maintenance_window}
        setSelectedPatp={setSelectedPatp}
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
      <UserContextProvider>
        <HostingPresenter />
      </UserContextProvider>
    </Page>
  );
}
