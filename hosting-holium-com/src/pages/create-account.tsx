import { useEffect, useState } from 'react';
import { FormikValues } from 'formik';
import type { GetServerSideProps } from 'next/types';

import {
  CreateAccountDialog,
  OnboardingStorage,
  ThirdEarthProductType,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  // We use underscore to highlight that this is a query param.
  product_type: ThirdEarthProductType;
  hide_already_have_account: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const hide_already_have_account = (query.haha ?? '') as string;
  const product_type = (query.product_type ??
    'planet') as ThirdEarthProductType;

  return {
    props: {
      product_type,
      hide_already_have_account: hide_already_have_account === 'true',
    },
  };
};

export default function CreateAccount({
  product_type,
  hide_already_have_account,
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
        return goToPage('/verify-email', {
          product_type,
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
          hide_already_have_account ? undefined : onAlreadyHaveAccount
        }
      />
    </Page>
  );
}
