import { FormikValues } from 'formik';
import type { GetServerSideProps } from 'next/types';

import {
  OnboardingStorage,
  ThirdEarthProductType,
  VerifyEmailDialog,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  // We use underscore to highlight that this is a query param.
  product_type: ThirdEarthProductType;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const product_type = (query.product_type ??
    'planet') as ThirdEarthProductType;

  return {
    props: {
      product_type,
    } as ServerSideProps,
  };
};

export default function VerifyEmail({ product_type }: ServerSideProps) {
  const { goToPage } = useNavigation();

  const onResend = () => {
    const { email, passwordHash } = OnboardingStorage.get();

    // TODO: unhash
    const password = passwordHash;

    if (email && password) {
      try {
        thirdEarthApi.register(email, password);
      } catch (error) {
        console.error(error);
        goToPage('/');
      }
    }
  };

  const onBack = () => goToPage('/');

  const onNext = async ({ verificationcode }: FormikValues) => {
    try {
      const result = await thirdEarthApi.verifyEmail(verificationcode);
      OnboardingStorage.set({ token: result.token });

      if (result) {
        if (product_type === 'byop-p') {
          return goToPage('/upload-pier-disclaimer');
        } else {
          return goToPage('/choose-id');
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <Page title="Verify email">
      <VerifyEmailDialog onResend={onResend} onBack={onBack} onNext={onNext} />
    </Page>
  );
}
