import { GetServerSideProps } from 'next';
import { Anchor } from '@holium/design-system/general';
import { LoginDialog, OnboardDialogDescription } from '@holium/shared';
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
    try {
      const response = await thirdEarthApi.login(email, password);
      localStorage.setItem('token', response.token);

      if (redirectAfterLogin) goToPage(redirectAfterLogin as any);
      else goToPage('/account');

      return Boolean(response);
    } catch (error) {
      console.error(error);

      return false;
    }
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
