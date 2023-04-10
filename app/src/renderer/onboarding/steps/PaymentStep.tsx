import { PaymentDialog } from '@holium/shared';
import { StepProps } from './types';

export const PaymentStep = ({ setStep }: StepProps) => {
  const onBack = () => {
    setStep('/');
  };

  const onNext = () => {
    setStep('/booting');

    return Promise.resolve(false);
  };

  return (
    <PaymentDialog
      products={[]}
      productId={0}
      patp=""
      email=""
      stripe={undefined}
      stripeOptions={undefined}
      setProductId={() => {}}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
