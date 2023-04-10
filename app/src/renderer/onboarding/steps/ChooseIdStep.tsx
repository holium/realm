import { ChooseIdDialog } from '@holium/shared';
import { StepProps } from './types';

export const ChooseIdStep = ({ setStep }: StepProps) => {
  const onSelectPatp = () => {
    setStep('/');
  };

  const onNext = () => {
    setStep('/payment');

    return Promise.resolve(false);
  };

  return (
    <ChooseIdDialog patps={[]} onSelectPatp={onSelectPatp} onNext={onNext} />
  );
};
