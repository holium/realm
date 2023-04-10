import { VerifyEmailDialog } from '@holium/shared';
import { StepProps } from './types';

export const VerifyEmailStep = ({ setStep }: StepProps) => {
  const onResend = () => {
    setStep('/');
  };

  const onBack = () => {
    setStep('/login');
  };

  const onNext = () => {
    setStep('/choose-id');

    return Promise.resolve(false);
  };

  return (
    <VerifyEmailDialog onResend={onResend} onBack={onBack} onNext={onNext} />
  );
};
