import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { Anchor } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import {
  LearnMoreModal,
  LoginDialog,
  OnboardDialogDescription,
  OnboardingStorage,
} from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { defaultTheme } from '../../lib/defaultTheme';
import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

export const LoginStep = ({ setStep, onFinish }: StepProps) => {
  const learnMoreModal = useToggle(false);

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

    // Create a local master account from the ThirdEarth account.
    const masterAccount = await OnboardingIPC.createMasterAccount({
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
          OnboardingIPC.createAccount(
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
    <>
      <LearnMoreModal
        isOpen={learnMoreModal.isOn}
        onDismiss={learnMoreModal.toggleOff}
        onAccept={learnMoreModal.toggleOff}
      />
      <LoginDialog
        showTerms
        prefilledEmail={prefilledEmail}
        label={
          <OnboardDialogDescription>
            Don't have access?{' '}
            <Anchor rel="noreferrer" target="_blank" href="https://holium.com">
              Join waitlist
            </Anchor>
            {' / '}
            <Anchor
              rel="noreferrer"
              target="_blank"
              style={{ textDecoration: 'underline' }}
              onClick={learnMoreModal.toggleOn}
            >
              Learn more
            </Anchor>
          </OnboardDialogDescription>
        }
        onLogin={onLogin}
      />
    </>
  );
};
