import { GetServerSideProps } from 'next';

import { Anchor } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import {
  ChangePasswordWithTokenModal,
  ForgotPassword,
  ForgotPasswordModal,
  LoginDialog,
  OnboardDialogDescription,
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
  const redirectAfterLogin = (query.redirect ?? '') as string;

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

  const onNoAccount = () => goToPage('/');

  const onBack = () => {
    window.location.href = 'https://holium.com';
  };

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
    const response = await thirdEarthApi.login(email, password);

    if (!response.token || !response.email) {
      return false;
    } else {
      OnboardingStorage.set({ token: response.token, email: response.email });
    }

    if (redirectAfterLogin) goToPage(redirectAfterLogin as any);
    else {
      const ships = await thirdEarthApi.getUserShips(response.token);

      if (ships.length > 0) goToPage('/account');
      else goToPage('/account/download-realm');
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
        label={
          <OnboardDialogDescription>
            Don't have an account yet?{' '}
            <Anchor onClick={onNoAccount}>Sign up</Anchor>.
          </OnboardDialogDescription>
        }
        prefilledEmail={prefilledEmail}
        footer={<ForgotPassword onClick={() => forgotPassword.toggleOn()} />}
        onBack={onBack}
        onLogin={onLogin}
      />
    </Page>
  );
}
