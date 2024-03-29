import { CSSProperties } from 'react';

import { Portal } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import {
  AccountHostingDialogBody,
  ChangeEmailModal,
  ChangeMaintenanceWindowModal,
  ChangePasswordModal,
  EjectIdModal,
  GetNewAccessCodeModal,
  OnboardingStorage,
  useUser,
  VerifyEmailModal,
} from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { OnboardingIPC } from 'renderer/stores/ipc';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

export const forceCenterStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
};

type Props = {
  account: MobXAccount;
};

export const AccountHostingSection = ({ account }: Props) => {
  const { ships, refetchShips } = useUser();

  const changeEmailModal = useToggle(false);
  const verifyEmailModal = useToggle(false);
  const changePasswordModal = useToggle(false);
  const getNewAccessCodeModal = useToggle(false);
  const changeMaintenanceWindowModal = useToggle(false);
  const ejectIdModal = useToggle(false);

  const ship = ships.find((s) => s.patp === account.serverId);

  const { email, token } = OnboardingStorage.get();

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
    if (!token) return false;
    if (!email) return false;

    try {
      const response = await thirdEarthApi.changePassword(token, password);

      if (response?.token) {
        // Also update the password locally.
        const result = await OnboardingIPC.updatePassword(email, password);

        if (result) changePasswordModal.toggleOff();

        return result;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  const onSubmitNewAccessCode = async () => {
    if (!token) return Promise.resolve(false);
    if (!ship) return Promise.resolve(false);

    const response = await thirdEarthApi.resetShipCode(
      token,
      ship.id.toString()
    );

    if (response) return true;
    return false;
  };

  const onSubmitNewMaintenanceWindow = async (maintenanceWindow: string) => {
    if (!token) return Promise.resolve(false);
    if (!ship) return Promise.resolve(false);

    const response = await thirdEarthApi.updateMaintenanceWindow(
      token,
      ship.id.toString(),
      maintenanceWindow
    );

    if (response?.maintenance_window) {
      await refetchShips();

      changeMaintenanceWindowModal.toggleOff();

      return true;
    }

    return false;
  };

  const onSubmitEjectId = async (ejectAddress: string, ethAddress: string) => {
    if (!token) return Promise.resolve(false);
    if (!ship) return Promise.resolve(false);

    const response = await thirdEarthApi.ejectShip(
      token,
      ship.id.toString(),
      ejectAddress,
      ethAddress
    );

    if (response) return true;

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

  if (!email || !ship) return null;

  return (
    <>
      <Portal>
        <ChangeEmailModal
          style={forceCenterStyle}
          isOpen={changeEmailModal.isOn}
          onDismiss={changeEmailModal.toggleOff}
          onSubmit={onSubmitNewEmail}
        />
      </Portal>
      <Portal>
        <VerifyEmailModal
          style={forceCenterStyle}
          isOpen={verifyEmailModal.isOn}
          onDismiss={verifyEmailModal.toggleOff}
          onSubmit={onSubmitVerificationToken}
        />
      </Portal>
      <Portal>
        <GetNewAccessCodeModal
          style={forceCenterStyle}
          isOpen={getNewAccessCodeModal.isOn}
          onDismiss={getNewAccessCodeModal.toggleOff}
          onSubmit={onSubmitNewAccessCode}
        />
      </Portal>
      <Portal>
        <ChangePasswordModal
          style={forceCenterStyle}
          isOpen={changePasswordModal.isOn}
          onDismiss={changePasswordModal.toggleOff}
          onSubmit={onSubmitNewPassword}
        />
      </Portal>
      <Portal>
        <ChangeMaintenanceWindowModal
          style={forceCenterStyle}
          isOpen={changeMaintenanceWindowModal.isOn}
          initialSelected={ship.maintenance_window.toString()}
          onDismiss={changeMaintenanceWindowModal.toggleOff}
          onSubmit={onSubmitNewMaintenanceWindow}
        />
      </Portal>
      <Portal>
        <EjectIdModal
          style={forceCenterStyle}
          isOpen={ejectIdModal.isOn}
          onDismiss={ejectIdModal.toggleOff}
          onSubmit={onSubmitEjectId}
        />
      </Portal>
      <SettingSection
        title="Configure your server"
        body={
          <AccountHostingDialogBody
            selectedIdentity={ship.patp}
            email={ship.email}
            serverUrl={ship.link}
            serverCode={ship.code}
            serverMaintenanceWindow={ship.maintenance_window}
            onClickChangeEmail={changeEmailModal.toggleOn}
            onClickChangePassword={changePasswordModal.toggleOn}
            onClickManageBilling={onClickManageBilling}
            onClickGetNewAccessCode={() => getNewAccessCodeModal.toggleOn()}
            onClickChangeMaintenanceWindow={
              changeMaintenanceWindowModal.toggleOn
            }
            onClickEjectId={ejectIdModal.toggleOn}
          />
        }
      />
    </>
  );
};
