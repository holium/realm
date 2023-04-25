import { useEffect } from 'react';
import { ClaimTokenDialog, OnboardingStorage } from '@holium/shared';
import { GetServerSideProps } from 'next';

import { Page } from 'components/Page';

import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type Props = {
  inviteToken: string;
  email: string;
  full_account: boolean;
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  const inviteToken = query.token as string;
  const email = query.email as string;
  const full_account = (query.full_account as string) === 'true';

  const redirectHome = () => {
    res.writeHead(302, { Location: '/' });
    res.end();
  };

  // If the token is not present, redirect to the home page.
  if (!inviteToken) {
    redirectHome();
    return { props: {} };
  }

  return {
    props: {
      inviteToken,
      email,
      full_account,
    },
  };
};

export default function ClaimInvite({
  inviteToken,
  email,
  full_account,
}: Props) {
  const { goToPage } = useNavigation();

  const onAlreadyHaveAccount = () => goToPage('/login');

  const onClaim = async (password: string) => {
    try {
      const { token } = await thirdEarthApi.resetPassword(
        inviteToken,
        password,
        true
      );
      if (!token) return false;

      OnboardingStorage.set({ token });
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
