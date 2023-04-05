import { GetServerSideProps } from 'next';
import { ClaimTokenDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';

type Props = {
  token: string;
  email: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  const token = query.token as string;
  const email = query.email as string;

  const redirectHome = () => {
    res.writeHead(302, { Location: '/' });
    res.end();
  };

  // If the token is not present, redirect to the home page.
  if (!token) {
    redirectHome();
    return { props: {} };
  }

  return {
    props: {
      token,
      email,
    },
  };
};

export default function ClaimToken({ token, email }: Props) {
  const { goToPage } = useNavigation();

  const onAlreadyHaveAccount = () => goToPage('/login');

  const onClaim = async (password: string) => {
    try {
      const result = await api.resetPassword(token, password, true);
      if (!result.token) return false;

      localStorage.setItem('token', result.token);
      goToPage('/account/download-realm');

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <Page title="Claim your Realm invite">
      <ClaimTokenDialog
        email={email}
        onAlreadyHaveAccount={onAlreadyHaveAccount}
        onClaim={onClaim}
      />
    </Page>
  );
}
