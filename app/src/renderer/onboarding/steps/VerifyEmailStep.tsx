import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { VerifyEmailDialog } from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';

export const VerifyEmailStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Verify email');
  });

  const onResend = () => {
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');

    if (email && password) {
      try {
        thirdEarthApi.register(email, password);
      } catch (error) {
        console.error(error);
        setStep('/');
      }
    }
  };

  const onBack = () => setStep('/');

  const onNext = async (verificationcode: string) => {
    try {
      const result = await thirdEarthApi.verifyEmail(verificationcode);
      localStorage.setItem('token', result.token);

      if (Boolean(result)) setStep('/choose-id');

      return Boolean(result);
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <VerifyEmailDialog onResend={onResend} onBack={onBack} onNext={onNext} />
  );
};
