import { useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import type { GetServerSideProps } from 'next/types';

import {
  OnboardingStorage,
  PaymentDialog,
  ThirdEarthProduct,
  ThirdEarthProductType,
} from '@holium/shared';

import { Page } from '../components/Page';
import { constants } from '../util/constants';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  products: ThirdEarthProduct[];
};

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await thirdEarthApi.getProducts();

  return {
    props: {
      products,
    } as ServerSideProps,
  };
};

export default function Payment({
  products: unfilteredProducts,
}: ServerSideProps) {
  const { goToPage } = useNavigation();

  const [serverId, setServerId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const [stripe, setStripe] = useState<Stripe>();
  const [clientSecret, setClientSecret] = useState<string>();

  const [productType, setProductType] =
    useState<ThirdEarthProductType>('planet');

  const products = unfilteredProducts.filter(
    (product) => product.product_type === productType
  );

  const [productId, setProductId] = useState(products[0].id);
  const [invoiceId, setInvoiceId] = useState<string>();

  useEffect(() => {
    const { serverId, email, token, productType } = OnboardingStorage.get();

    if (!serverId || !email || !token) return;

    setServerId(serverId);
    setEmail(email);
    setToken(token);
    if (productType) {
      setProductType(productType as ThirdEarthProductType);
    }

    const getSecretAndSetupStripe = async () => {
      const response = await thirdEarthApi.stripeMakePayment(
        token,
        productId.toString(),
        serverId
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

  const onBack = () => {
    if (productType === 'byop-p') {
      return goToPage('/');
    } else {
      return goToPage('/choose-id');
    }
  };

  const onNext = async () => {
    if (!token || !serverId || !invoiceId || !productId) return false;

    if (productType === 'planet') {
      await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
      await thirdEarthApi.updatePlanetStatus(token, serverId, 'sold');
      await thirdEarthApi.ship(
        token,
        serverId,
        productId.toString(),
        invoiceId
      );
      return goToPage('/booting');
    } else if (productType === 'byop-p') {
      await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
      const provisionalResponse = await thirdEarthApi.provisionalShipEntry({
        token,
        email,
        invoiceId,
        product: productId.toString(),
      });

      if (!provisionalResponse) return false;

      return goToPage('/migrate-id');
    }

    return false;
  };

  return (
    <Page title="Payment" isProtected>
      <PaymentDialog
        productType={productType}
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
    </Page>
  );
}
