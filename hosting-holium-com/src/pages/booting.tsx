import { useCallback, useEffect, useRef, useState } from 'react';

import { useToggle } from '@holium/design-system/util';
import { BootingDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function Booting() {
  const { goToPage } = useNavigation();

  const intervalRef = useRef<NodeJS.Timer>();
  const [logs, setLogs] = useState<string[]>(['Booting started.']);
  const booting = useToggle(true);

  const pollShipStatus = useCallback(async () => {
    const { serverId, token } = OnboardingStorage.get();

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

      // Store credentials for next page.
      OnboardingStorage.set({
        serverUrl,
        serverCode,
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
