import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { Anchor } from '@holium/design-system/general';
import {
  LoginDialog,
  OnboardDialogDescription,
  OnboardingStorage,
} from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';
import { defaultTheme } from '../../lib/defaultTheme';
import { RealmIPC } from '../../stores/ipc';

export const LoginStep = ({ setStep }: StepProps) => {
  const prefilledEmail = OnboardingStorage.get().email ?? '';

  useEffect(() => {
    track('Onboarding / Login');
  });

  const onLogin = async (email: string, password: string) => {
    const response = await thirdEarthApi.login(email, password, true);

    // TODO: hash
    const passwordHash = password;

    if (
      !response.token ||
      !response.email ||
      !response.client_side_encryption_key
    ) {
      return false;
    }

    // Create a local master account from the ThirdEarth account.
    const masterAccount = await RealmIPC.createMasterAccount({
      email: response.email,
      password,
      encryptionKey: response.client_side_encryption_key,
      authToken: response.token,
    });

    if (!masterAccount) return false;

    OnboardingStorage.set({
      email: response.email,
      passwordHash,
      clientSideEncryptionKey: response.client_side_encryption_key,
      token: response.token,
      masterAccountId: masterAccount.id,
    });

    const userShips = await thirdEarthApi.getUserShips(response.token);

    if (userShips.length > 0) {
      // Create a "default" account for each ship.
      // The user can customize their passports later.
      userShips.forEach((ship) => {
        RealmIPC.createAccount(
          {
            accountId: masterAccount.id,
            password,
            patp: ship.patp,
            url: ship.link,
            avatar: '',
            nickname: ship.screen_name,
            description: '',
            color: '#000000',
            type: 'hosted',
            status: 'online',
            theme: JSON.stringify(defaultTheme),
          },
          ship.code
        );
      });

      OnboardingStorage.reset();
    } else {
      setStep('/hosting');
    }

    return true;
  };

  return (
    <LoginDialog
      showTerms
      prefilledEmail={prefilledEmail}
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
