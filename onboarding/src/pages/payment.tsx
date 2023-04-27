import { useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';

import {
  OnboardingStorage,
  PaymentDialog,
  ThirdEarthProduct,
} from '@holium/shared';

import { Page } from '../components/Page';
import { constants } from '../util/constants';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  products: ThirdEarthProduct[];
};

export async function getServerSideProps() {
  const products = await thirdEarthApi.getProducts();

  return {
    props: {
      products,
    } as ServerSideProps,
  };
}

export default function Payment({ products }: ServerSideProps) {
  const { goToPage } = useNavigation();

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

      const stripe = await loadStripe(constants.STRIPE_KEY);
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

  const onBack = () => goToPage('/choose-id');

  const onNext = async () => {
    if (!token || !shipId || !invoiceId || !productId)
      return Promise.resolve(false);

    await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
    await thirdEarthApi.updatePlanetStatus(token, shipId, 'sold');
    await thirdEarthApi.ship(token, shipId, productId.toString(), invoiceId);

    goToPage('/booting');

    return true;
  };

  return (
    <Page title="Payment" isProtected>
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
    </Page>
  );
}
