import { Portal, useToggle } from '@holium/design-system';
import {
  AccountSelfHostingDialogBody,
  ChangeEmailModal,
  ChangePasswordModal,
  useUser,
  VerifyEmailModal,
} from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { OnboardingIPC } from 'renderer/stores/ipc';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';
import { forceCenterStyle } from './AccountHostingSection';

type Props = {
  account: MobXAccount;
};

export const AccountSelfHostingSection = ({ account }: Props) => {
  const { token, email } = useUser();

  const changeEmail = useToggle(false);
  const verifyEmail = useToggle(false);
  const changePassword = useToggle(false);

  const onSubmitNewEmail = async (email: string) => {
    if (!token) return Promise.resolve(false);
    try {
      const response = await thirdEarthApi.changeEmail(token, email);

      if (response.email) {
        changeEmail.toggleOff();
        verifyEmail.toggleOn();
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
        // Also update the password locally.
        const result = await OnboardingIPC.updatePassword(
          account.serverId,
          password
        );

        if (result) changePassword.toggleOff();

        return result;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  return (
    <>
      <Portal>
        <ChangeEmailModal
          style={forceCenterStyle}
          isOpen={changeEmail.isOn}
          onDismiss={changeEmail.toggleOff}
          onSubmit={onSubmitNewEmail}
        />
      </Portal>
      <Portal>
        <VerifyEmailModal
          style={forceCenterStyle}
          isOpen={verifyEmail.isOn}
          onDismiss={verifyEmail.toggleOff}
          onSubmit={onSubmitVerificationToken}
        />
      </Portal>
      <Portal>
        <ChangePasswordModal
          style={forceCenterStyle}
          isOpen={changePassword.isOn}
          onDismiss={changePassword.toggleOff}
          onSubmit={onSubmitNewPassword}
        />
      </Portal>
      <SettingSection
        title="Account"
        body={
          <AccountSelfHostingDialogBody
            email={email ?? ''}
            onClickChangeEmail={changeEmail.toggleOn}
            onClickChangePassword={changePassword.toggleOn}
          />
        }
      />
    </>
  );
};
