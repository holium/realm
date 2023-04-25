import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { CredentialsDialog, OnboardingStorage } from '@holium/shared';
import { StepProps } from './types';

export const CredentialsStep = ({ setStep }: StepProps) => {
  const [credentials, setCredentials] = useState({
    id: '',
    url: '',
    accessCode: '',
  });

  const onNext = () => {
    setStep('/passport');

    return Promise.resolve(true);
  };

  useEffect(() => {
    track('Onboarding / Credentials');
  });

  useEffect(() => {
    const { shipId, shipUrl, shipCode } = OnboardingStorage.get();
    if (!shipId || !shipUrl || !shipCode) return;

    setCredentials({
      id: shipId,
      url: shipUrl,
      accessCode: shipCode,
    });
    window.onboardingService.setCredentials({
      patp: shipId,
      code: shipCode,
      url: shipUrl,
    });
  }, []);

  return <CredentialsDialog credentials={credentials} onNext={onNext} />;
};
