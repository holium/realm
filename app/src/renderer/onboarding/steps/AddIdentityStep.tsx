import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import {
  AddIdentityDialog,
  defaultTheme,
  OnboardingStorage,
} from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const AddIdentityStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Identity');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = async (
    serverId: string,
    serverUrl: string,
    serverCode: string
  ) => {
    const sanitizedCookie = await OnboardingIPC.getCookieAndOpenConduit({
      serverId,
      serverUrl,
      serverCode,
    });

    if (!sanitizedCookie || !serverId || !serverUrl || !serverCode) {
      console.log('getCookieAndOpenConduit error: %o', {
        sanitizedCookie,
        serverId,
        serverUrl,
        serverCode,
      });
      return false;
    }

    OnboardingStorage.set({
      serverId,
      serverUrl,
      serverCode,
    });

    OnboardingIPC.setCredentials({
      serverId,
      serverCode,
      serverUrl,
    });

    // const { passwordHash, masterAccountId } = OnboardingStorage.get();
    const result = await OnboardingIPC.getFirstMasterAccount();
    if (!result) {
      throw new Error('You have no masterAccount');
    }
    const { id: masterAccountId, passwordHash } = result;

    OnboardingStorage.set({
      serverId,
      serverUrl,
      serverCode,
      passwordHash,
      clientSideEncryptionKey: await OnboardingIPC.getClientEncryptionKey(),
    });

    if (!serverId || !passwordHash || !masterAccountId) {
      console.log('OnboardingStorage.get error: %o', {
        sanitizedCookie,
        serverId,
        serverUrl,
        serverCode,
        passwordHash,
        masterAccountId,
      });
      return false;
    }

    await OnboardingIPC.createAccount(
      {
        accountId: masterAccountId,
        passwordHash,
        serverId,
        serverUrl,
        serverType: 'local',
        avatar: '',
        nickname: '',
        description: '',
        color: '#000000',
        status: 'initial',
        theme: JSON.stringify(defaultTheme),
      },
      passwordHash,
      serverCode
    );

    setStep('/installation');

    return true;
  };

  return <AddIdentityDialog onBack={onBack} onNext={onNext} />;
};
