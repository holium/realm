import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { CredentialsDialog } from '@holium/shared';
import { StepProps } from './types';

export const CredentialsStep = ({ setStep }: StepProps) => {
  const [credentials, setCredentials] = useState({
    id: '',
    url: '',
    accessCode: '',
  });

  const onNext = () => {
    setStep('/passport');

    return Promise.resolve(false);
  };

  useEffect(() => {
    track('Onboarding / Credentials');
  });

  useEffect(() => {
    setCredentials({
      id: localStorage.getItem('patp') ?? '',
      url: localStorage.getItem('url') ?? '',
      accessCode: localStorage.getItem('accessCode') ?? '',
    });
  }, []);

  return <CredentialsDialog credentials={credentials} onNext={onNext} />;
};
