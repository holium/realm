import { CreateAccountDialog } from '@holium/shared';
import { StepProps } from './types';

export const CreateAccountStep = ({ setStep }: StepProps) => {
  const onAlreadyHaveAccount = () => {
    setStep('/login');
  };

  const onNext = () => {
    setStep('/verify-email');

    return Promise.resolve(false);
  };

  return (
    <CreateAccountDialog
      onAlreadyHaveAccount={onAlreadyHaveAccount}
      onNext={onNext}
    />
  );
};
