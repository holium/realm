import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { FormikValues } from 'formik';

import { ChooseIdentityDialog, OnboardingStorage } from '@holium/shared';

import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

export const ChooseIdStep = ({ setStep }: StepProps) => {
  const [identities, setPatps] = useState<string[]>([]);

  useEffect(() => {
    track('Onboarding / Choose ID');
  });

  useEffect(() => {
    const getAndSetPatps = async () => {
      const products = await thirdEarthApi.getProducts();
      const productId = products[0].id;

      const planets = await thirdEarthApi.getPlanets(productId);
      const identities = Object.values(planets.planets)
        .filter((planet) => planet.planet_status === 'available')
        .map((planet) => planet.patp);

      setPatps(identities);
    };

    getAndSetPatps();
  }, []);

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = ({ id }: FormikValues) => {
    OnboardingStorage.set({ serverId: id });

    setStep('/payment');

    return Promise.resolve(true);
  };

  return (
    <ChooseIdentityDialog
      identities={identities}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
