import { ReactNode, useEffect, useState } from 'react';

import { Flex, Spinner, useToggle } from '@holium/design-system';
import { OnboardingStorage } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';

import { SettingSection } from '../../components/SettingSection';
import { AccountLoginSection } from './AccountLoginSection';

type Props = {
  children: ReactNode;
};

export const MaybeLogin = ({ children }: Props) => {
  const loading = useToggle(true);
  const authenticated = useToggle(false);

  const { email: storedEmail, token: storedToken } = OnboardingStorage.get();

  const [email, setEmail] = useState(storedEmail ?? '');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    const response = await thirdEarthApi.login(email, password, true);

    if (
      !response.token ||
      !response.email ||
      !response.client_side_encryption_key
    ) {
      return false;
    } else {
      OnboardingStorage.set({
        email: response.email,
        clientSideEncryptionKey: response.client_side_encryption_key,
        token: response.token,
      });
      authenticated.toggleOn();
    }

    return true;
  };

  useEffect(() => {
    loading.toggleOn();

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
      <SettingSection
        title="Sign in"
        body={
          <AccountLoginSection
            email={email}
            password={password}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
          />
        }
        onSubmit={onLogin}
      />
    );
  }

  return <>{children}</>;
};
