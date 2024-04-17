import { useEffect } from 'react';
import { FormikValues } from 'formik';
import { GetServerSideProps } from 'next';

import { ClaimTokenDialog, OnboardingStorage } from '@holium/shared';

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
  const inviteToken = query.token as string | undefined;
  const email = query.email as string | undefined;
  const full_account = (query.full_account as string) === 'true';

  const redirectHome = () => {
    res.writeHead(302, { Location: '/' });
    res.end();
  };

  // If the token is not present, redirect to the home page.
  if (!inviteToken || !email) {
    redirectHome();

    return {
      props: {
        inviteToken: '',
        email: '',
        full_account: false,
      },
    };
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

  const onNext = async ({ password }: FormikValues) => {
    try {
      const { token } = await thirdEarthApi.resetPassword(
        inviteToken,
        password,
        true
      );
      if (!token) return false;

      OnboardingStorage.set({ token });

      return goToPage('/account');
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  useEffect(() => {
    if (full_account) {
      goToPage('/login', {
        email,
        redirect_url: '/account',
      });
    }
  }, []);

  return (
    <Page title="Claim your Realm invite">
      {!full_account && <ClaimTokenDialog email={email} onNext={onNext} />}
    </Page>
  );
}
