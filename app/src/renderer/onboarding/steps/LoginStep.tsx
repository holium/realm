import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { Anchor } from '@holium/design-system/general';
import { LoginDialog, OnboardDialogDescription } from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';
import { RealmIPC } from 'renderer/stores/ipc';
import { defaultTheme } from 'renderer/lib/defaultTheme';

type LoginStepProps = {
  onFinish: () => void;
} & StepProps;

export const LoginStep = ({ setStep, onFinish }: LoginStepProps) => {
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

      // Create a master account from the ThirdEarth account.
      const masterAccount = await RealmIPC.createMasterAccount({
        email: response.email,
        encryptionKey: response.client_side_encryption_key,
        authToken: response.token,
        password: password,
      });

      if (!masterAccount) return false;

      localStorage.setItem('masterAccountId', masterAccount.id.toString());

      const userShips = await thirdEarthApi.getUserShips(response.token);

      if (userShips.length > 0) {
        // Create a "default" account for each ship.
        // The user can customize their passports later.
        userShips.forEach((ship) => {
          RealmIPC.createAccount({
            accountId: masterAccount.id,
            patp: ship.patp,
            url: ship.link,
            avatar: '',
            nickname: ship.screen_name,
            description: '',
            color: '#000000',
            type: 'hosted',
            status: 'online',
            theme: JSON.stringify(defaultTheme),
          });
        });
        onFinish();
      } else {
        // Go to the hosted / self hosted step.
        setStep('/hosting');
      }

      return true;
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
