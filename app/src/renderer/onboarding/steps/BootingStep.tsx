import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { BootingDialog, OnboardingStorage } from '@holium/shared';
import { useToggle } from '@holium/design-system/util';
import { thirdEarthApi } from '../thirdEarthApi';
import { StepProps } from './types';

export const BootingStep = ({ setStep }: StepProps) => {
  const intervalRef = useRef<NodeJS.Timer>();
  const [logs, setLogs] = useState<string[]>(['Booting started.']);
  const booting = useToggle(true);

  const pollShipStatus = useCallback(async () => {
    const shipId = OnboardingStorage.get().shipId;
    const token = OnboardingStorage.get().token;

    if (!shipId || !token) return;

    const ships = await thirdEarthApi.getUserShips(token);
    const ship = Object.values(ships).find((s) => s.patp === shipId);

    if (!ship) return;

    if (logs.length === 1) {
      setLogs((logs) => [...logs, `${shipId} will be ready in a few minutes.`]);
    } else if (logs.length === 2) {
      setLogs((logs) => [...logs, 'Go touch some grass.']);
    }

    const shipCode = ship.code;
    if (shipCode) {
      setLogs((logs) => [...logs, 'Assigning a domain.']);
    }

    const shipUrl = ship.link;
    const isBooted = shipUrl.includes('https://');
    if (isBooted) {
      booting.toggleOff();
      if (intervalRef.current) clearInterval(intervalRef.current);

      setLogs((logs) => [
        ...logs,
        `Successfully assigned a domain: ${shipUrl}.`,
        'Booting complete.',
      ]);

      // Store credentials for next step.
      OnboardingStorage.set({
        shipUrl,
        shipCode,
      });
    }
  }, [booting, logs]);

  const onNext = useCallback(() => {
    setStep('/credentials');

    return Promise.resolve(false);
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
