import { useEffect, useRef, useState } from 'react';

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

  const isBYOP = useToggle(false);

  const pollShipStatus = async () => {
    const { serverId, token, productType } = OnboardingStorage.get();

    if (!token) return;

    const ships = await thirdEarthApi.getUserShips(token);
    let ship = Object.values(ships).find((s) => s.patp === serverId);

    if (productType === 'byop-p') {
      isBYOP.toggleOn();
      ship = Object.values(ships)
        .filter((s) => s.product_type === 'byop-p' && s.is_migration)
        .sort((a, b) => {
          if (a.created_at > b.created_at) return -1;
          if (a.created_at < b.created_at) return 1;
          return 0;
        })[0];
    }

    if (!ship) return;

    if (logs.length === 1) {
      if (productType === 'byop-p') {
        setLogs((logs) => [
          ...logs,
          `Your uploaded identity will be ready in 5-10 minutes.`,
        ]);
      } else {
        setLogs((logs) => [
          ...logs,
          `${serverId} will be ready in a few minutes.`,
        ]);
      }
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
  };

  const onNext = () => {
    if (isBYOP.isOn) {
      return goToPage('/account');
    }

    return goToPage('/credentials');
  };

  useEffect(() => {
    if (!booting.isOn) return;

    const i = setInterval(pollShipStatus, 5000);
    intervalRef.current = i;

    return () => clearInterval(i);
  }, [booting]);

  return (
    <Page title="Booting your identity" isProtected>
      <BootingDialog logs={logs} isBooting={booting.isOn} onNext={onNext} />
    </Page>
  );
}
