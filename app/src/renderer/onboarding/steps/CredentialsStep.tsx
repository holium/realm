import { CredentialsDialog } from '@holium/shared';
import { StepProps } from './types';

export const CredentialsStep = ({ setStep }: StepProps) => {
  const onBack = () => {
    setStep('/');
  };

  const onNext = () => {
    setStep('/login');

    return Promise.resolve(false);
  };

  return (
    <CredentialsDialog
      credentials={{} as any}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
