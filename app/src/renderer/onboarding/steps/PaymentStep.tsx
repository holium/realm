import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import {
  OnboardDialogSkeleton,
  PaymentDialog,
  ThirdEarthProduct,
  OnboardingStorage,
} from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';
import { Stripe, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

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
    const { shipId, email, token } = OnboardingStorage.get();

    if (!shipId || !email || !token) return;

    setShipId(shipId);
    setEmail(email);
    setToken(token);

    const getSecretAndSetupStripe = async () => {
      const response = await thirdEarthApi.stripeMakePayment(
        token,
        productId.toString(),
        shipId
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

  useEffect(() => {
    const stripeIframe = document.querySelector('iframe');
    const stripeIframeBody = stripeIframe?.contentDocument?.body;
    if (stripeIframeBody) stripeIframeBody.style.cursor = 'none !important';
  }, [stripe]);

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
