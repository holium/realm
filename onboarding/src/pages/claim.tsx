import { GetServerSideProps } from 'next';
import { ClaimTokenDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';
import { useEffect } from 'react';

type Props = {
  token: string;
  email: string;
  full_account: boolean;
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  const token = query.token as string;
  const email = query.email as string;
  const full_account = (query.full_account as string) === 'true';

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
      full_account,
    },
  };
};

export default function ClaimToken({ token, email, full_account }: Props) {
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

  useEffect(() => {
    if (full_account) {
      goToPage('/login', {
        email,
        redirect: '/account/download-realm',
      });
    }
  }, []);

  return (
    <Page title="Claim your Realm invite">
      {!full_account && (
        <ClaimTokenDialog
          email={email}
          onAlreadyHaveAccount={onAlreadyHaveAccount}
          onClaim={onClaim}
        />
      )}
    </Page>
  );
}
