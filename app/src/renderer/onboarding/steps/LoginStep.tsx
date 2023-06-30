import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { Anchor } from '@holium/design-system/general';
import {
  defaultTheme,
  LoginDialog,
  OnboardDialogDescription,
  OnboardingStorage,
  TermsDisclaimer,
} from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

export const LoginStep = ({ forcedNextStep, setStep }: StepProps) => {
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

    const passwordHash = await OnboardingIPC.hashPassword(password);

    if (!passwordHash) return false;

    // Create a local master account from the ThirdEarth account.
    const masterAccount = await OnboardingIPC.createMasterAccount({
      email: response.email,
      passwordHash,
      encryptionKey: response.client_side_encryption_key,
      authToken: response.token,
    });

    if (!masterAccount) return false;
    OnboardingStorage.remove('lastAccountLogin');

    OnboardingStorage.set({
      masterAccountId: masterAccount.id,
      email: response.email,
      token: response.token,
      clientSideEncryptionKey: response.client_side_encryption_key,
      passwordHash,
    });

    const userShips = await thirdEarthApi.getUserShips(response.token);

    if (userShips.length > 0) {
      // Create a "default" account for each ship.
      // The user can customize their passports later.

      // Filter out ships that are unfinished BYOP uploads.
      const finishedShips = userShips.filter(
        (ship) => ship.product_type !== 'byop-p' || ship.ship_type === 'planet'
      );

      await Promise.all(
        finishedShips.map((ship) =>
          OnboardingIPC.createAccount(
            {
              accountId: masterAccount.id,
              passwordHash: masterAccount.passwordHash,
              serverId: ship.patp,
              serverUrl: ship.link,
              serverType: 'hosted',
              avatar: '',
              nickname: ship.screen_name,
              description: '',
              color: '#000000',
              status: 'initial',
              theme: JSON.stringify(defaultTheme),
            },
            password,
            ship.code
          )
        )
      );

      if (forcedNextStep) {
        setStep(forcedNextStep);
      } else {
        OnboardingIPC.finishOnboarding();
      }
    } else {
      setStep(forcedNextStep ?? '/hosting');
    }

    return true;
  };

  return (
    <LoginDialog
      prefilledEmail={prefilledEmail}
      label={
        <OnboardDialogDescription>
          Don't have access?{' '}
          <Anchor rel="noreferrer" target="_blank" href="https://holium.com">
            Join waitlist
          </Anchor>{' '}
          or{' '}
          <Anchor
            rel="noreferrer"
            target="_blank"
            href="https://hosting.holium.com"
          >
            Purchase hosting
          </Anchor>{' '}
        </OnboardDialogDescription>
      }
      footer={<TermsDisclaimer onClick={() => {}} />}
      onLogin={onLogin}
    />
  );
};
