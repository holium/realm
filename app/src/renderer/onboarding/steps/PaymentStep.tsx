import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PaymentDialog, ThirdEarthProduct } from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';
import { Stripe, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

type PaymentStepViewProps = StepProps & {
  products: ThirdEarthProduct[];
};

const PaymentStepView = ({ products, setStep }: PaymentStepViewProps) => {
  const [patp, setPatp] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const [stripe, setStripe] = useState<Stripe>();
  const [clientSecret, setClientSecret] = useState<string>();

  const [productId, setProductId] = useState(products[0].id);
  const [invoiceId, setInvoiceId] = useState<string>();

  useEffect(() => {
    const patp = localStorage.getItem('patp');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (!token || !patp || !email) return;

    setPatp(patp);
    setEmail(email);
    setToken(token);

    const getSecretAndSetupStripe = async () => {
      const response = await thirdEarthApi.stripeMakePayment(
        token,
        productId.toString(),
        patp
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
    if (!token || !patp || !invoiceId || !productId) return false;

    try {
      await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
      await thirdEarthApi.updatePlanetStatus(token, patp, 'sold');
      await thirdEarthApi.ship(token, patp, productId.toString(), invoiceId);

      setStep('/booting');

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <PaymentDialog
      products={products}
      productId={productId}
      patp={patp}
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

  if (!products.length) return null;

  return <PaymentStepView products={products} setStep={setStep} />;
};
