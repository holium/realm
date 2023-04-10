import { BootingDialog } from '@holium/shared';
import { StepProps } from './types';

export const BootingStep = ({ setStep }: StepProps) => {
  const onNext = () => {
    setStep('/credentials');

    return Promise.resolve(false);
  };

  return <BootingDialog logs={[]} isBooting={true} onNext={onNext} />;
};
