import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { CreateAccountDialog } from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';

export const CreateAccountStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Create account');
  });

  const onAlreadyHaveAccount = () => {
    setStep('/login');
  };

  const onNext = async (email: string, password: string) => {
    // Save email in local storage for later steps in the onboarding flow.
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);

    try {
      const result = await thirdEarthApi.register(email, password);
      if (Boolean(result)) setStep('/verify-email');
      return Boolean(result);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <CreateAccountDialog
      showTerms
      onAlreadyHaveAccount={onAlreadyHaveAccount}
      onNext={onNext}
    />
  );
};
