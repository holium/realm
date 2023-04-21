import { useCallback, useEffect, useRef, useState } from 'react';
import { BootingDialog, OnboardingStorage } from '@holium/shared';
import { useToggle } from '@holium/design-system/util';
import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';
import { thirdEarthApi } from '../util/thirdEarthApi';

export default function Booting() {
  const { goToPage } = useNavigation();

  const intervalRef = useRef<NodeJS.Timer>();
  const [logs, setLogs] = useState<string[]>(['Booting started.']);
  const booting = useToggle(true);

  const pollShipStatus = useCallback(async () => {
    const { shipId, token } = OnboardingStorage.get();

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

      // Store credentials for next page.
      OnboardingStorage.set({
        shipUrl,
        shipCode,
      });
    }
  }, [booting, logs]);

  const onNext = useCallback(() => goToPage('/credentials'), [goToPage]);

  useEffect(() => {
    if (!booting.isOn) return;

    const i = setInterval(pollShipStatus, 5000);
    intervalRef.current = i;

    return () => clearInterval(i);
  }, [booting, pollShipStatus]);

  return (
    <Page title="Booting your personal server" isProtected>
      <BootingDialog logs={logs} isBooting={booting.isOn} onNext={onNext} />
    </Page>
  );
}
