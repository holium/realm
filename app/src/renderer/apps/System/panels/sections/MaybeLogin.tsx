import { ReactNode, useEffect } from 'react';

import { Flex, Spinner, useToggle } from '@holium/design-system';
import { OnboardingStorage } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';

import { AccountLoginSection } from './AccountLoginSection';

type Props = {
  children: ReactNode;
};

export const MaybeLogin = ({ children }: Props) => {
  const loading = useToggle(true);
  const authenticated = useToggle(false);

  const { email: storedEmail, token: storedToken } = OnboardingStorage.get();

  useEffect(() => {
    const refreshAndStoreToken = async (token: string) => {
      try {
        const response = await thirdEarthApi.refreshToken(token);
        OnboardingStorage.set({ email: response.email, token: response.token });

        authenticated.toggleOn();
      } catch (error) {
        console.error(error);

        authenticated.toggleOff();
      } finally {
        loading.toggleOff();
      }
    };

    if (!storedToken) {
      authenticated.toggleOff();
      loading.toggleOff();
    } else {
      refreshAndStoreToken(storedToken);
    }
  }, [storedToken]);

  if (loading.isOn) {
    return (
      <Flex width="100%" justifyContent="center" alignItems="center" my={6}>
        <Spinner size={6} />
      </Flex>
    );
  }

  if (!authenticated.isOn) {
    return (
      <AccountLoginSection
        prefilledEmail={storedEmail}
        onLogin={authenticated.toggleOn}
      />
    );
  }

  return <>{children}</>;
};
