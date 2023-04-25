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

export const LoginStep = ({ setStep, onFinish }: StepProps) => {
  const prefilledEmail = OnboardingStorage.get().email ?? '';

  useEffect(() => {
    track('Onboarding / Login');
  });

  const onLogin = async (email: string, password: string) => {
    const response = await thirdEarthApi.login(email, password, true);

    if (
      !response.token ||
      !response.email ||
      !response.client_side_encryption_key
    ) {
      return false;
    }

    const passwordHash = await window.onboardingService.hashPassword(password);

    // Create a local master account from the ThirdEarth account.
    const masterAccount = await window.onboardingService.createMasterAccount({
      email: response.email,
      passwordHash,
      encryptionKey: response.client_side_encryption_key,
      authToken: response.token,
    });

    if (!masterAccount) return false;
    localStorage.removeItem('lastAccountLogin');

    OnboardingStorage.set({
      email: response.email,
      clientSideEncryptionKey: response.client_side_encryption_key,
      token: response.token,
      passwordHash: masterAccount.passwordHash,
      masterAccountId: masterAccount.id,
    });

    const userShips = await thirdEarthApi.getUserShips(response.token);

    if (userShips.length > 0) {
      // Create a "default" account for each ship.
      // The user can customize their passports later.
      await Promise.all(
        userShips.map((ship) =>
          window.onboardingService.createAccount(
            {
              accountId: masterAccount.id,
              passwordHash: masterAccount.passwordHash,
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
            password,
            ship.code
          )
        )
      );
      onFinish?.();
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
