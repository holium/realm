import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '@amplitude/analytics-browser';

import { useToggle } from '@holium/design-system/util';
import { BootingDialog, defaultTheme, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

export const BootingStep = ({ setStep }: StepProps) => {
  const intervalRef = useRef<NodeJS.Timer>();
  const [logs, setLogs] = useState<string[]>(['Booting started.']);
  const booting = useToggle(true);

  const pollShipStatus = useCallback(async () => {
    const serverId = OnboardingStorage.get().serverId;
    const token = OnboardingStorage.get().token;

    if (!serverId || !token) return;

    const ships = await thirdEarthApi.getUserShips(token);
    const ship = Object.values(ships).find((s) => s.patp === serverId);

    if (!ship) return;

    if (logs.length === 1) {
      setLogs((logs) => [
        ...logs,
        `${serverId} will be ready in a few minutes.`,
      ]);
    } else if (logs.length === 2) {
      setLogs((logs) => [...logs, 'Go touch some grass.']);
    }

    const serverCode = ship.code;
    if (serverCode) {
      setLogs((logs) => [...logs, 'Assigning a domain.']);
    }

    const serverUrl = ship.link;
    const isBooted = serverUrl.includes('https://');
    if (isBooted) {
      booting.toggleOff();
      if (intervalRef.current) clearInterval(intervalRef.current);

      setLogs((logs) => [
        ...logs,
        `Successfully assigned a domain: ${serverUrl}.`,
        'Booting complete.',
      ]);

      // Store credentials for next step.
      OnboardingStorage.set({
        serverUrl,
        serverCode,
      });
    }
  }, [booting, logs]);

  const onNext = useCallback(async () => {
    const { masterAccountId, serverId, serverUrl, serverCode, passwordHash } =
      OnboardingStorage.get();

    if (
      !masterAccountId ||
      !serverId ||
      !serverUrl ||
      !serverCode ||
      !passwordHash
    ) {
      return false;
    }

    const newAccount = await OnboardingIPC.createAccount(
      {
        accountId: masterAccountId,
        passwordHash,
        serverId: serverId,
        serverUrl: serverUrl,
        serverType: 'hosted',
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

    if (newAccount) {
      setStep('/credentials');

      return true;
    } else {
      return false;
    }
  }, [setStep]);

  useEffect(() => {
    track('Onboarding / Booting');
  });

  useEffect(() => {
    if (!booting.isOn) return;

    const i = setInterval(pollShipStatus, 5000);
    intervalRef.current = i;

    return () => clearInterval(i);
  }, [booting, pollShipStatus]);

  return <BootingDialog logs={logs} isBooting={booting.isOn} onNext={onNext} />;
};
