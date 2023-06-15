import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';

import {
  OnboardDialogSkeleton,
  OnboardingStorage,
  PaymentDialog,
  ThirdEarthProduct,
} from '@holium/shared';

import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

type PaymentStepViewProps = StepProps & {
  products: ThirdEarthProduct[];
};

const PaymentStepView = ({ products, setStep }: PaymentStepViewProps) => {
  const [serverId, setserverId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const [stripe, setStripe] = useState<Stripe>();
  const [clientSecret, setClientSecret] = useState<string>();

  const [productId, setProductId] = useState(products[0].id);
  const [invoiceId, setInvoiceId] = useState<string>();

  useEffect(() => {
    const {
      serverId: storedserverId,
      email: storedEmail,
      token: storedToken,
    } = OnboardingStorage.get();

    if (!storedserverId || !storedEmail || !storedToken) return;

    setserverId(storedserverId);
    setEmail(storedEmail);
    setToken(storedToken);

    const getSecretAndSetupStripe = async () => {
      const response = await thirdEarthApi.stripeMakePayment(
        storedToken,
        productId.toString(),
        storedserverId
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
    if (!token || !serverId || !invoiceId || !productId) {
      return Promise.resolve(false);
    }

    await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
    await thirdEarthApi.updatePlanetStatus(token, serverId, 'sold');
    await thirdEarthApi.ship(token, serverId, productId.toString(), invoiceId);

    setStep('/booting');

    return true;
  };

  return (
    <PaymentDialog
      productType="planet"
      products={products}
      productId={productId}
      patp={serverId}
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
