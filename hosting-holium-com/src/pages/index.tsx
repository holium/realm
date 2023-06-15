import { useEffect } from 'react';
import type { GetServerSideProps } from 'next/types';

import { GetOnRealmDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';

type Props = {
  email: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const email = (query.email ?? '') as string;

  return {
    props: {
      email,
    },
  };
};

export default function GetOnRealm({ email }: Props) {
  const { goToPage } = useNavigation();

  const onBack = () => {
    window.location.href = 'https://holium.com';
  };

  const onMigrateId = () => {
    OnboardingStorage.set({ product: 'migrate-id' });

    return goToPage('/create-account');
  };

  const onPurchaseId = async () => {
    OnboardingStorage.remove('product');

    return goToPage('/create-account');
  };

  useEffect(() => {
    OnboardingStorage.set({ email });
  }, [email]);

  return (
    <Page title="Get on Realm">
      <GetOnRealmDialog
        onMigrateId={onMigrateId}
        onPurchaseId={onPurchaseId}
        // Email query parameter means they're coming from the landing page.
        onBack={email ? onBack : undefined}
      />
    </Page>
  );
}
