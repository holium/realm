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
  // We use underscore to highlight that this is a query param.
  product_type: ThirdEarthProductType;
  back_url?: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const products = await thirdEarthApi.getProducts();
  const back_url = (query.back_url ?? '') as string;
  const product_type = (query.product_type ??
    'planet') as ThirdEarthProductType;

  return {
    props: {
      products,
      product_type,
      back_url,
    } as ServerSideProps,
  };
};

export default function Payment({
  products: unfilteredProducts,
  product_type,
  back_url,
}: ServerSideProps) {
  const { goToPage } = useNavigation();

  const [serverId, setServerId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const [stripe, setStripe] = useState<Stripe>();
  const [clientSecret, setClientSecret] = useState<string>();

  const products = unfilteredProducts.filter(
    (product) => product.product_type === product_type
  );

  const [productId, setProductId] = useState(products[0].id);
  const [invoiceId, setInvoiceId] = useState<string>();

  useEffect(() => {
    const { serverId, email, token } = OnboardingStorage.get();

    if (!email || !token) return;

    if (product_type === 'planet') {
      if (serverId) setServerId(serverId);
      else return; // Must have serverId for planet.
    }

    setEmail(email);
    setToken(token);

    const getSecretAndSetupStripe = async () => {
      const response = await thirdEarthApi.stripeMakePayment(
        token,
        productId.toString(),
        // Don't pass serverId for byop-p.
        product_type !== 'byop-p' && serverId ? serverId : undefined
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

    if (product_type === 'byop-p') {
      return goToPage('/');
    } else {
      return goToPage('/choose-id');
    }
  };

  const onNext = async () => {
    if (!token || !invoiceId || !productId) return false;

    if (product_type === 'byop-p') {
      await thirdEarthApi.log(token, {
        file: 'purchases',
        type: 'info',
        subject: 'FRONTEND: payment step (email notify)',
        message: `Succesful stripe purchase of byop-p by ${email}.`,
        productId: productId.toString(),
        auditTrailCode: 1000,
      });

      try {
        // Critical request, so we quit if it fails.
        await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
      } catch (e) {
        console.error(e);
        return false;
      }

      try {
        // This server call should be non-blocking since the user has already paid.
        await thirdEarthApi.provisionalShipEntry({
          token,
          product: productId.toString(),
          invoiceId,
          shipType: 'provisional',
        });
      } catch (e) {
        console.error(e);
      }

      return goToPage('/upload-id', {
        product_type: 'byop-p',
      });
    } else {
      // Product type planet also requires serverId.
      if (!serverId) return false;

      await thirdEarthApi.log(token, {
        file: 'purchases',
        type: 'info',
        subject: 'FRONTEND: payment step (email notify)',
        message: `Succesful stripe purchase of planet by ${email}.`,
        productId: productId.toString(),
        auditTrailCode: 1000,
      });

      try {
        // Critical request, so we quit if it fails.
        await thirdEarthApi.updatePaymentStatus(token, invoiceId, 'OK');
      } catch (e) {
        console.error(e);
        return false;
      }

      try {
        // These server calls should be non-blocking since the user has already paid.
        await thirdEarthApi.updatePlanetStatus(token, serverId, 'sold');
        await thirdEarthApi.provisionalShipEntry({
          token,
          patp: serverId,
          product: productId.toString(),
          invoiceId,
          shipType: 'planet',
        });
      } catch (e) {
        console.error(e);
      }

      return goToPage('/booting', {
        product_type,
      });
    }
  };

  return (
    <Page title="Payment" isProtected>
      <PaymentDialog
        productType={product_type}
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
