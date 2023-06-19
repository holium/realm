import { useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import type { GetServerSideProps } from 'next/types';

import {
  OnboardingPage,
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
  back_url?: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const products = await thirdEarthApi.getProducts();
  const back_url = (query.back_url ?? '') as string;

  return {
    props: {
      products,
      back_url,
    } as ServerSideProps,
  };
};

export default function Payment({
  products: unfilteredProducts,
  back_url,
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
    if (back_url) {
      return goToPage(back_url as OnboardingPage);
    }

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
      await thirdEarthApi.provisionalShipEntry({
        token,
        patp: serverId,
        product: productId.toString(),
        invoiceId,
        shipType: 'planet',
      });

      return goToPage('/booting');
    } else if (productType === 'byop-p') {
      await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
      const provisionalResponse = await thirdEarthApi.provisionalShipEntry({
        token,
        product: productId.toString(),
        invoiceId,
        shipType: 'provisional',
      });

      if (!provisionalResponse) return false;

      OnboardingStorage.set({
        provisionalShipId: provisionalResponse[0].id.toString(),
      });

      return goToPage('/upload-id');
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
