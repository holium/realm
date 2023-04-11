import { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { PaymentDialog, ThirdEarthProduct } from '@holium/shared';
import { Page } from 'components/Page';
import { constants } from '../util/constants';
import { useNavigation } from '../util/useNavigation';
import { api } from '../util/api';

type ServerSideProps = {
  products: ThirdEarthProduct[];
};

export async function getServerSideProps() {
  const products = await api.getProducts();

  return {
    props: {
      products,
    } as ServerSideProps,
  };
}

export default function Payment({ products }: ServerSideProps) {
  const { goToPage } = useNavigation();

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
      const response = await api.stripeMakePayment(
        token,
        productId.toString(),
        patp
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
    if (!token || !patp || !invoiceId || !productId) return false;

    try {
      await api.updatePaymentStatus(token, invoiceId, 'OK');
      await api.updatePlanetStatus(token, patp, 'sold');
      await api.ship(token, patp, productId.toString(), invoiceId);

      goToPage('/booting');

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <Page title="Payment" isProtected>
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
    </Page>
  );
}
