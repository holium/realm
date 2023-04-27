import { CSSProperties, useEffect, useState } from 'react';

import { Portal } from '@holium/design-system';
import { useToggle } from '@holium/design-system/util';
import {
  ChangeEmailModal,
  ChangeMaintenanceWindowModal,
  ChangePasswordModal,
  EjectIdModal,
  GetNewAccessCodeModal,
  VerifyEmailModal,
} from '@holium/shared';
import { AccountHostingDialogBody } from '@holium/shared/src/onboarding/dialogs/bodies/AccountHostingDialogBody';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

const forceCenterStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
};

type Props = {
  account: MobXAccount;
};

export const AccountHostingSection = ({ account }: Props) => {
  const changeEmailModal = useToggle(false);
  const verifyEmailModal = useToggle(false);
  const changePasswordModal = useToggle(false);
  const getNewAccessCodeModal = useToggle(false);
  const changeMaintenanceWindowModal = useToggle(false);
  const ejectIdModal = useToggle(false);

  const [managePaymentLink, setManagePaymentLink] = useState<string>('');

  const email = '';
  const token = '';
  const maintenanceWindow = 0;
  const shipCode = '';

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
    if (!account) return Promise.resolve(false);

    const response = await thirdEarthApi.resetShipCode(
      token,
      account.patp.toString()
    );

    if (response) return true;
    return false;
  };

  const onSubmitNewMaintenanceWindow = async (maintenanceWindow: string) => {
    if (!token) return Promise.resolve(false);
    if (!account) return Promise.resolve(false);

    const response = await thirdEarthApi.updateMaintenanceWindow(
      token,
      account.patp.toString(),
      maintenanceWindow
    );

    if (response?.maintenance_window) return true;
    return false;
  };

  const onClickManageBilling = () => {
    window.open(managePaymentLink, '_blank');
  };

  const onSubmitEjectId = async (ejectAddress: string, ethAddress: string) => {
    if (!token) return Promise.resolve(false);
    if (!account) return Promise.resolve(false);

    const response = await thirdEarthApi.ejectShip(
      token,
      account.patp.toString(),
      ejectAddress,
      ethAddress
    );

    if (response) return true;

    return false;
  };

  useEffect(() => {
    if (!token) return;
    thirdEarthApi
      .getManagePaymentLink(token)
      .then((response) => setManagePaymentLink(response.url));
  }, [token]);

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
          initialSelected={maintenanceWindow.toString()}
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
        title="Hosting"
        body={
          <AccountHostingDialogBody
            selectedPatp={account.patp}
            email={email}
            shipUrl={account.url}
            shipCode={shipCode}
            shipMaintenanceWindow={maintenanceWindow}
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
