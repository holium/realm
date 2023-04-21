import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { Stripe, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  OnboardDialogSkeleton,
  PaymentDialog,
  ThirdEarthProduct,
  OnboardingStorage,
} from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';

type PaymentStepViewProps = StepProps & {
  products: ThirdEarthProduct[];
};

const PaymentStepView = ({ products, setStep }: PaymentStepViewProps) => {
  const [shipId, setShipId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const [stripe, setStripe] = useState<Stripe>();
  const [clientSecret, setClientSecret] = useState<string>();

  const [productId, setProductId] = useState(products[0].id);
  const [invoiceId, setInvoiceId] = useState<string>();

  useEffect(() => {
    const {
      shipId: storedShipId,
      email: storedEmail,
      token: storedToken,
    } = OnboardingStorage.get();

    if (!storedShipId || !storedEmail || !storedToken) return;

    setShipId(storedShipId);
    setEmail(storedEmail);
    setToken(storedToken);

    const getSecretAndSetupStripe = async () => {
      const response = await thirdEarthApi.stripeMakePayment(
        storedToken,
        productId.toString(),
        storedShipId
      );
      setClientSecret(response.clientSecret);
      setInvoiceId(response.invoiceId);

      const stripe = await loadStripe(process.env.STRIPE_KEY as string);
      if (stripe) setStripe(stripe);
    };

    try {
      getSecretAndSetupStripe();
    } catch (e) {
      console.error(e);
    }
  }, [productId]);

  const stripeOptions: StripeElementsOptions = {
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  const onBack = () => setStep('/choose-id');

  const onNext = async () => {
    if (!token || !shipId || !invoiceId || !productId) {
      return Promise.resolve(false);
    }

    await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
    await thirdEarthApi.updatePlanetStatus(token, shipId, 'sold');
    await thirdEarthApi.ship(token, shipId, productId.toString(), invoiceId);

    setStep('/booting');

    return true;
  };

  return (
    <PaymentDialog
      products={products}
      productId={productId}
      patp={shipId}
      email={email}
      stripe={stripe as any}
      stripeOptions={stripeOptions as any}
      setProductId={setProductId}
      onBack={onBack}
      onNext={onNext}
    />
  );
};

export const PaymentStep = ({ setStep }: StepProps) => {
  const [products, setProducts] = useState<ThirdEarthProduct[]>([]);

  useEffect(() => {
    track('Onboarding / Payment');
  });

  useEffect(() => {
    thirdEarthApi.getProducts().then(setProducts);
  }, []);

  if (!products.length) return <OnboardDialogSkeleton />;

  return <PaymentStepView products={products} setStep={setStep} />;
};
