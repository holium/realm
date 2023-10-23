import { FormikValues } from 'formik';
import { GetServerSideProps } from 'next';

import {
  ChooseIdentityDialog,
  OnboardingPage,
  OnboardingStorage,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export type ChooseIdServerSideProps = {
  identities: string[];
  back_url: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const back_url = (query.back_url ?? '') as string;
  const products = await thirdEarthApi.getProducts();
  const productId = products[0].id;

  const planets = await thirdEarthApi.getPlanets(productId);
  const identities = Object.values(planets.planets).map(
    (planet) => planet.patp
  );

  return {
    props: {
      identities,
      back_url,
    } as ChooseIdServerSideProps,
  };
};

export default function ChooseId({
  identities,
  back_url,
}: ChooseIdServerSideProps) {
  const { goToPage } = useNavigation();

  const onBack = back_url.length
    ? () => goToPage(back_url as OnboardingPage)
    : undefined;

  const onNext = ({ id }: FormikValues) => {
    OnboardingStorage.set({ serverId: id });

    return goToPage('/payment');
  };

  return (
    <Page title="Choose ID" isProtected>
      <ChooseIdentityDialog
        identities={identities}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}
