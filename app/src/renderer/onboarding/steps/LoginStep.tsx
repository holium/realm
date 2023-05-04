import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { Anchor } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import {
  LearnMoreModal,
  LoginDialog,
  OnboardDialogDescription,
  OnboardingStorage,
  TermsDisclaimer,
} from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { defaultTheme } from '../../lib/defaultTheme';
import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

export const LoginStep = ({ forcedNextStep, setStep }: StepProps) => {
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
      await Promise.all(
        userShips.map((ship) =>
          OnboardingIPC.createAccount(
            {
              accountId: masterAccount.id,
              passwordHash: masterAccount.passwordHash,
              serverId: ship.patp,
              serverUrl: ship.link,
              serverCode: ship.code,
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
    <>
      <LearnMoreModal
        isOpen={learnMoreModal.isOn}
        onDismiss={learnMoreModal.toggleOff}
        onAccept={learnMoreModal.toggleOff}
      />
      <LoginDialog
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
        footer={<TermsDisclaimer onClick={() => {}} />}
        onLogin={onLogin}
      />
    </>
  );
};
