import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { Anchor } from '@holium/design-system/general';
import { LoginDialog, OnboardDialogDescription } from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';
import { RealmIPC } from 'renderer/stores/ipc';

export const LoginStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Login');
  });

  const onLogin = async (email: string, password: string) => {
    try {
      const response = await thirdEarthApi.login(email, password, true);

      if (
        !response.token ||
        !response.email ||
        !response.client_side_encryption_key
      ) {
        throw new Error('Invalid response from login');
      } else {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.email);
        localStorage.setItem(
          'client_side_encryption_key',
          response.client_side_encryption_key
        );
      }

      const userShips = await thirdEarthApi.getUserShips(response.token);
      const hasShips = userShips.length > 0;

      if (hasShips) {
        const patp = userShips[0].patp;
        const url = userShips[0].link;
        // Now we need to create a local Realm account from the ThirdEarth account.
        RealmIPC.createAccount({
          patp,
          url,
          email: response.email,
          password,
          encryptionKey: response.client_side_encryption_key,
        });
        // We also need to populate the local Realm account with the ships from the ThirdEarth account.
      } else {
        // Go to the hosted / self hosted step.
        setStep('/hosting');
      }

      return Boolean(response);
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <LoginDialog
      showTerms
      prefilledEmail={localStorage.getItem('email') ?? ''}
      label={
        <OnboardDialogDescription>
          Don't have access?{' '}
          <Anchor rel="noreferrer" target="_blank" href="https://holium.com">
            Join waitlist
          </Anchor>
          .
        </OnboardDialogDescription>
      }
      onLogin={onLogin}
    />
  );
};
