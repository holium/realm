import { ChooseIdDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { useNavigation } from '../util/useNavigation';
import { api } from '../util/api';

type ServerSideProps = {
  patps: string[];
};

export async function getServerSideProps() {
  const products = await api.getProducts();
  const productId = products[0].id;

  const planets = await api.getPlanets(productId);
  const patps = Object.values(planets.planets)
    .filter((planet) => planet.planet_status === 'available')
    .map((planet) => planet.patp);

  return {
    props: {
      patps,
    } as ServerSideProps,
  };
}

export default function ChooseId({ patps }: ServerSideProps) {
  const { goToPage } = useNavigation();

  const onSelectPatp = (patp: string) => {
    localStorage.setItem('patp', patp);
  };

  const onNext = () => goToPage('/payment');

  return (
    <Page title="Choose ID" isProtected>
      <ChooseIdDialog
        patps={patps}
        onSelectPatp={onSelectPatp}
        onNext={onNext}
      />
    </Page>
  );
}
