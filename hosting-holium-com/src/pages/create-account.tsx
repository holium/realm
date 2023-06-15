import { useEffect, useState } from 'react';
import { FormikValues } from 'formik';

import { CreateAccountDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function CreateAccount() {
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
        onAlreadyHaveAccount={onAlreadyHaveAccount}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}
