import { Anchor } from '@holium/design-system/general';
import {
  LoginDialog,
  OnboardDialogDescription,
  OnboardingStorage,
} from '@holium/shared';
import { GetServerSideProps } from 'next';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
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

  const onNoAccount = () => goToPage('/');

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
      <LoginDialog
        label={
          <OnboardDialogDescription>
            Don't have an account yet?{' '}
            <Anchor onClick={onNoAccount}>Sign up</Anchor>.
          </OnboardDialogDescription>
        }
        prefilledEmail={prefilledEmail}
        onLogin={onLogin}
      />
    </Page>
  );
}
