import { useEffect, useState } from 'react';

import { OnboardingStorage, UploadPierDialog } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type SftpServer = {
  ipAddress: string;
  password: string;
};

const poll = (
  abortSignal: AbortSignal,
  pollingFunction: () => Promise<boolean>,
  timeout: number
) => {
  return new Promise<boolean>((resolve) => {
    const executePolling = async () => {
      if (abortSignal.aborted) return resolve(false);
      const result = await pollingFunction();
      if (result) return resolve(true);
      setTimeout(executePolling, timeout);
    };
    executePolling();
  });
};

export default function UploadPierPage() {
  const { goToPage } = useNavigation();

  const [sftpServer, setSftpServer] = useState<SftpServer>();

  const [error, setError] = useState<string>();

  const getUnbootedByopShip = async () => {
    const { token } = OnboardingStorage.get();

    if (!token) {
      setError('Unauthorized. Please log in again.');
      return null;
    }

    const ships = await thirdEarthApi.getUserShips(token);
    return ships.find(
      (ship) => ship.product_type === 'byop-p' && ship.ship_type !== 'planet'
    );
  };

  const shipIsReady = async () => {
    const ship = await getUnbootedByopShip();
    if (ship && ship.ship_type !== 'provisional') return true;
    setError('No BYOP ship found.');
    return false;
  };

  const sftpIsReady = async () => {
    const ship = await getUnbootedByopShip();
    if (ship && ship.ship_type.includes('dropletReady')) {
      const [_status, _pier, password, ipAddress] = ship.ship_type.split('|');
      setSftpServer({ password, ipAddress });
      return true;
    }
    return false;
  };

  const pierIsUploaded = async () => {
    const ship = await getUnbootedByopShip();
    if (!ship) return false;

    return ship.ship_type.includes('pierReceived');
  };

  const prepareSftpServer = async () => {
    const { token } = OnboardingStorage.get();
    if (!token) return false;

    const ship = await getUnbootedByopShip();
    if (!ship) return false;

    try {
      const sftpResponse = await thirdEarthApi.prepareSftpServerForPierUpload(
        token,
        ship.id.toString()
      );
      if (!sftpResponse) return false;

      await thirdEarthApi.log(token, {
        file: 'purchases',
        type: 'info',
        subject: 'FRONTEND: SFTP started (email notify)',
        message: `Upload with SFTP started.`,
      });

      return true;
    } catch (e) {
      setError('Failed to start SFTP upload.');
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const executeFlow = async () => {
      if (!(await poll(signal, shipIsReady, 1000))) return;
      if (!(await prepareSftpServer())) return;
      if (!(await poll(signal, sftpIsReady, 1000))) return;
      if (!(await poll(signal, pierIsUploaded, 5000))) return;

      setError(undefined);
      goToPage('/booting', { product_type: 'byop-p' });
    };

    executeFlow();

    return () => {
      abortController.abort();
    };
  }, []);

  const onBack = () => {
    goToPage('/account');
  };

  return (
    <Page title="Upload Pier with SFTP" isProtected>
      <UploadPierDialog
        password={sftpServer?.password}
        ipAddress={sftpServer?.ipAddress}
        error={error}
        onBack={onBack}
      />
    </Page>
  );
}
