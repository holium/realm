import { GetServerSideProps } from 'next';

import { useToggle } from '@holium/design-system/util';
import {
  ChangePasswordWithTokenModal,
  ForgotPassword,
  ForgotPasswordModal,
  LoginDialog,
  OnboardingStorage,
} from '@holium/shared';

import { thirdEarthApi } from 'util/thirdEarthApi';

import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';

type Props = {
  prefilledEmail: string;
  redirectAfterLogin: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const prefilledEmail = (query.email ?? '') as string;
  const redirectAfterLogin = (query.redirect_url ?? '') as string;

  return {
    props: {
      prefilledEmail,
      redirectAfterLogin,
    },
  };
};

export default function Login({ prefilledEmail, redirectAfterLogin }: Props) {
  const { goToPage } = useNavigation();

  const forgotPassword = useToggle(false);
  const resetPassword = useToggle(false);

  const onBack = () => goToPage('/');

  const onForgotPassword = async (email: string) => {
    const response = await thirdEarthApi.forgotPassword(email);

    if (response) {
      OnboardingStorage.set({ email });

      forgotPassword.toggleOff();
      resetPassword.toggleOn();

      return true;
    } else {
      return false;
    }
  };

  const onResetPassword = async (token: string, password: string) => {
    const response = await thirdEarthApi.resetPassword(token, password);

    if (response?.token) {
      OnboardingStorage.set({ token: response.token });

      resetPassword.toggleOff();

      return true;
    } else {
      return false;
    }
  };

  const onLogin = async (email: string, password: string) => {
    const response = await thirdEarthApi.login(email, password, true);

    if (!response.token || !response.email) {
      return false;
    } else {
      OnboardingStorage.set({
        token: response.token,
        email: response.email,
        clientSideEncryptionKey: response.client_side_encryption_key,
      });
    }

    if (redirectAfterLogin) goToPage(redirectAfterLogin as any);
    else {
      goToPage('/account');
    }

    return true;
  };

  return (
    <Page title="Login">
      <ForgotPasswordModal
        isOpen={forgotPassword.isOn}
        onDismiss={forgotPassword.toggleOff}
        onSubmit={onForgotPassword}
      />
      <ChangePasswordWithTokenModal
        isOpen={resetPassword.isOn}
        onDismiss={resetPassword.toggleOff}
        onSubmit={onResetPassword}
      />
      <LoginDialog
        prefilledEmail={prefilledEmail}
        footer={<ForgotPassword onClick={() => forgotPassword.toggleOn()} />}
        onBack={onBack}
        onLogin={onLogin}
      />
    </Page>
  );
}
