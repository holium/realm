import { useCallback, useEffect, useRef, useState } from 'react';
import { BootingDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { useNavigation } from '../util/useNavigation';
import { api } from '../util/api';
import { useToggle } from '@holium/design-system';

export default function Booting() {
  const { goToPage } = useNavigation();

  const intervalRef = useRef<NodeJS.Timer>();
  const [logs, setLogs] = useState<string[]>(['Booting started.']);
  const booting = useToggle(true);

  const pollShipStatus = useCallback(async () => {
    const patp = localStorage.getItem('patp');
    const token = localStorage.getItem('token');

    if (!patp || !token) return;

    const ships = await api.getUserShips(token);
    const ship = Object.values(ships).find((s) => s.patp === patp);

    if (!ship) return;

    if (logs.length === 1) {
      setLogs((logs) => [...logs, `${patp} will be ready in a few minutes.`]);
    } else if (logs.length === 2) {
      setLogs((logs) => [...logs, 'Go touch some grass.']);
    }

    const shipCode = ship.code;
    if (shipCode) {
      setLogs((logs) => [...logs, 'Assigning a domain.']);
    }

    const shipLink = ship.link;
    const isBooted = shipLink.includes('https://');
    if (isBooted) {
      booting.toggleOff();
      if (intervalRef.current) clearInterval(intervalRef.current);

      setLogs((logs) => [
        ...logs,
        `Successfully assigned a domain: ${shipLink}.`,
        'Booting complete.',
      ]);

      // Store credentials for next page.
      localStorage.setItem('url', shipLink);
      localStorage.setItem('accessCode', shipCode);
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
