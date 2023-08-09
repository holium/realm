import { useEffect } from 'react';
import { FormikValues } from 'formik';
import type { GetServerSideProps } from 'next/types';

import { OnboardingStorage } from '@holium/shared';

import { CreateAccountWithWalletDialog } from '../../../shared/src/onboarding/dialogs/CreateAccountWithWallet/CreateAccountWithWalletDialog';
import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  token: string | undefined;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      token: query.token as string | undefined,
    },
  };
};

export default function CreateAccount({ token }: ServerSideProps) {
  const { goToPage } = useNavigation();

  const onNext = async ({ email, password }: FormikValues) => {
    // TODO: hash password
    OnboardingStorage.set({ email, passwordHash: password });

    try {
      const result = await thirdEarthApi.register(email, password);
      if (result) {
        return goToPage('/verify-email', {
          product_type: 'planet',
        });
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      OnboardingStorage.set({ token });
    }
  });

  return (
    <Page title="Create your account" isProtected>
      <CreateAccountWithWalletDialog onNext={onNext} />
    </Page>
  );
}
