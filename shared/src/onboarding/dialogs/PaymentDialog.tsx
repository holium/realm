import { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  CardNumberElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { Flex, Spinner } from '@holium/design-system';
import { OnboardDialogTitle } from '../components/OnboardDialog.styles';
import { PaymentIcon } from '../icons/PaymentIcon';
import { OnboardDialog } from '../components/OnboardDialog';
import { PaymentForm } from '../components/payment/PaymentForm';
import { ProductCards } from '../components/payment/ProductCards';
import { AccountInformation } from '../components/payment/AccountInformation';
import { ThirdEarthProduct } from '../types';

type Props = {
  products: ThirdEarthProduct[];
  productId: number;
  patp: string;
  email: string;
  stripe: Stripe | undefined;
  stripeOptions: StripeElementsOptions | undefined;
  setProductId: (productId: number) => void;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

const PaymentDialogPresenter = ({
  products,
  productId,
  patp,
  email,
  stripeOptions,
  setProductId,
  onBack,
  onNext,
}: Props) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleOnNext = async () => {
    if (!stripe || !elements) return Promise.resolve(false);

    const card = elements.getElement(CardNumberElement);

    if (!card) return Promise.resolve(false);

    const payload = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    // Execute the payment.
    try {
      if (!stripeOptions?.clientSecret) return Promise.resolve(false);

      const result = await stripe.confirmCardPayment(
        stripeOptions.clientSecret,
        {
          payment_method: payload.paymentMethod?.id,
        }
      );

      if (result.error) {
        console.error(result.error);
      } else {
        if (result.paymentIntent?.status === 'succeeded') {
          return onNext();
        }
      }
    } catch (e) {
      console.error(e);
    }

    return Promise.resolve(false);
  };

  return (
    <OnboardDialog
      icon={<PaymentIcon />}
      body={
        <Flex flexDirection="column" gap={16} marginBottom={30}>
          <OnboardDialogTitle>Payment</OnboardDialogTitle>
          <ProductCards
            products={products}
            productId={productId}
            setProductId={setProductId}
          />
          <AccountInformation patp={patp} email={email} />
          <PaymentForm />
        </Flex>
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
          <Flex flexDirection="column" gap={16} marginBottom={30}>
            <OnboardDialogTitle>Payment</OnboardDialogTitle>
            <ProductCards
              products={props.products}
              productId={props.productId}
              setProductId={props.setProductId}
            />
            <AccountInformation patp={props.patp} email={props.email} />
            <Flex justifyContent="center" alignItems="center" my={30}>
              <Spinner size={3} />
            </Flex>
          </Flex>
        }
        nextText="Submit"
        onBack={props.onBack}
        onNext={() => Promise.resolve(false)}
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
