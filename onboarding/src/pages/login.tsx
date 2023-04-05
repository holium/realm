import { GetServerSideProps } from 'next';
import { LoginDialog } from '@holium/shared';
import { Page } from '../components/Page';
import { api } from '../util/api';
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
      const response = await api.login(email, password);
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
        prefilledEmail={prefilledEmail}
        onNoAccount={onNoAccount}
        onLogin={onLogin}
      />
    </Page>
  );
}
