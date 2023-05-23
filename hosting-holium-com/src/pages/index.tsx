import { FormikValues } from 'formik';
import { GetServerSideProps } from 'next';

import { CreateAccountDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type Props = {
  prefilledEmail: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const prefilledEmail = (query.email ?? '') as string;

  return {
    props: {
      prefilledEmail,
    },
  };
};

export default function CreateAccount({ prefilledEmail }: Props) {
  const { goToPage } = useNavigation();

  const onAlreadyHaveAccount = () => goToPage('/login');

  const onNext = async ({ email, password }: FormikValues) => {
    // TODO: hash password
    OnboardingStorage.set({ email, passwordHash: password });

    try {
      const result = await thirdEarthApi.register(email, password);
      if (Boolean(result)) goToPage('/verify-email');
      return Boolean(result);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <Page title="Create account">
      <CreateAccountDialog
        prefilledEmail={prefilledEmail}
        onAlreadyHaveAccount={onAlreadyHaveAccount}
        onNext={onNext}
      />
    </Page>
  );
}
