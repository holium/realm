import { GetServerSideProps } from 'next';

import {
  ChooseIdDialog,
  OnboardingPage,
  OnboardingStorage,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type ServerSideProps = {
  patps: string[];
  back_url: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const back_url = query.back_url ?? ('' as string);
  const products = await thirdEarthApi.getProducts();
  const productId = products[0].id;

  const planets = await thirdEarthApi.getPlanets(productId);
  const patps = Object.values(planets.planets)
    .filter((planet) => planet.planet_status === 'available')
    .map((planet) => planet.patp);

  return {
    props: {
      patps,
      back_url,
    } as ServerSideProps,
  };
};

export default function ChooseId({ patps, back_url }: ServerSideProps) {
  const { goToPage } = useNavigation();

  const onSelectPatp = (shipId: string) => {
    OnboardingStorage.set({ shipId });
  };

  const onBack =
    back_url.length > 0
      ? () => goToPage(back_url as OnboardingPage)
      : undefined;

  const onNext = () => goToPage('/payment');

  return (
    <Page title="Choose ID" isProtected>
      <ChooseIdDialog
        patps={patps}
        onSelectPatp={onSelectPatp}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}
