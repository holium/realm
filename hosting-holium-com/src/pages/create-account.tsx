import { useEffect, useState } from 'react';
import { FormikValues } from 'formik';
import type { GetServerSideProps } from 'next/types';

import { CreateAccountDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  hideAlreadyHaveAccount: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const hideAlreadyHaveAccount = (query.haha ?? '') as string;

  return {
    props: {
      hideAlreadyHaveAccount: hideAlreadyHaveAccount === 'true',
    },
  };
};

export default function CreateAccount({
  hideAlreadyHaveAccount,
}: ServerSideProps) {
  const { goToPage } = useNavigation();

  const [prefilledEmail, setPrefilledEmail] = useState<string>();

  const onAlreadyHaveAccount = () => goToPage('/login');

  const onBack = () => goToPage('/');

  const onNext = async ({ email, password }: FormikValues) => {
    // TODO: hash password
    OnboardingStorage.set({ email, passwordHash: password });

    try {
      const result = await thirdEarthApi.register(email, password);
      if (result) {
        return goToPage('/verify-email');
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  useEffect(() => {
    const { email } = OnboardingStorage.get();
    if (email) setPrefilledEmail(email);
  }, []);

  return (
    <Page title="Create account">
      <CreateAccountDialog
        prefilledEmail={prefilledEmail}
        onBack={onBack}
        onNext={onNext}
        onAlreadyHaveAccount={
          hideAlreadyHaveAccount ? undefined : onAlreadyHaveAccount
        }
      />
    </Page>
  );
}
