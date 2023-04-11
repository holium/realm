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

  const onBack = () => {
    setStep('/');
  };

  const onNext = () => {
    setStep('/login');

    return Promise.resolve(false);
  };

  useEffect(() => {
    track('Credentials');
  });

  useEffect(() => {
    setCredentials({
      id: localStorage.getItem('patp') ?? '',
      url: localStorage.getItem('url') ?? '',
      accessCode: localStorage.getItem('accessCode') ?? '',
    });
  }, []);

  return (
    <CredentialsDialog
      credentials={credentials}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
