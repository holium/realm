import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Stripe, StripeElementsOptions } from '@stripe/stripe-js';

import { Flex, Spinner } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import { OnboardDialogTitle } from '../../components/OnboardDialog.styles';
import { PaymentIcon } from '../../icons/PaymentIcon';
import { ThirdEarthPeriodicity, ThirdEarthPriceOption } from '../../types';
import { AccountInformation } from './AccountInformation';
import { PaymentForm } from './PaymentForm';
import { ProductCards } from './ProductCards';

type Props = {
  priceOptions: ThirdEarthPriceOption[];
  periodicity: ThirdEarthPeriodicity;
  setPeriodicity: (periodicity: ThirdEarthPeriodicity) => void;
  patp: string | undefined;
  email: string;
  stripe: Stripe | undefined;
  stripeOptions: StripeElementsOptions | undefined;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

const PaymentDialogPresenter = ({
  priceOptions,
  periodicity,
  setPeriodicity,
  patp,
  email,
  stripeOptions,
  onBack,
  onNext,
}: Props) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleOnNext = async () => {
    if (!stripe || !elements) return Promise.resolve(false);

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      return Promise.resolve(false);
    }

    const paymentMethodResult = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
    });

    if (!paymentMethodResult.paymentMethod || paymentMethodResult.error) {
      return false;
    }
    if (!stripeOptions?.clientSecret) return false;

    const result = await stripe.confirmCardPayment(stripeOptions.clientSecret, {
      payment_method: paymentMethodResult.paymentMethod?.id,
    });

    if (!result.error && result.paymentIntent?.status === 'succeeded') {
      return onNext();
    }

    return false;
  };

  return (
    <OnboardDialog
      icon={<PaymentIcon />}
      body={
        <>
          <OnboardDialogTitle>Payment</OnboardDialogTitle>
          <ProductCards
            priceOptions={priceOptions}
            periodicity={periodicity}
            setPeriodicity={setPeriodicity}
          />
          <AccountInformation patp={patp} email={email} />
          <PaymentForm />
        </>
      }
      nextText="Submit"
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};

export const PaymentDialog = ({ stripe, stripeOptions, ...props }: Props) => {
  if (!stripe || !stripeOptions) {
    return (
      <OnboardDialog
        icon={<PaymentIcon />}
        body={
          <>
            <OnboardDialogTitle>Payment</OnboardDialogTitle>
            <ProductCards
              priceOptions={props.priceOptions}
              periodicity={props.periodicity}
              setPeriodicity={props.setPeriodicity}
            />
            <AccountInformation patp={props.patp} email={props.email} />
            <Flex justifyContent="center" alignItems="center" my={30}>
              <Spinner size={3} />
            </Flex>
          </>
        }
        nextText="Submit"
        onBack={props.onBack}
        onNext={undefined}
      />
    );
  }

  return (
    <Elements stripe={stripe} options={stripeOptions}>
      <PaymentDialogPresenter
        stripe={stripe}
        stripeOptions={stripeOptions}
        {...props}
      />
    </Elements>
  );
};
