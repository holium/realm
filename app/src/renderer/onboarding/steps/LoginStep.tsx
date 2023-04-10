import { LoginDialog } from '@holium/shared';
import { StepProps } from './types';

export const LoginStep = ({ setStep }: StepProps) => {
  const onNoAccount = () => {
    setStep('/');
  };

  const onLogin = () => {
    setStep('/');

    return Promise.resolve(false);
  };

  return <LoginDialog onNoAccount={onNoAccount} onLogin={onLogin} />;
};
