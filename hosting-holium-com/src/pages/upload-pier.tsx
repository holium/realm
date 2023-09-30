import { useEffect, useState } from 'react';

import { OnboardingStorage, UploadPierDialog } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type SftpServer = {
  ipAddress: string;
  password: string;
};

export default function UploadPierPage() {
  const { goToPage } = useNavigation();

  const [sftpServer, setSftpServer] = useState<SftpServer>();

  const [error, setError] = useState<string>();

  const getByopShip = async () => {
    const { token } = OnboardingStorage.get();

    if (!token) {
      setError('Unathorized. Please log in again.');
      return false;
    }

    const ships = await thirdEarthApi.getUserShips(token);
    const byopShip = ships.find((ship) => ship.product_type === 'byop-p');

    return byopShip;
  };

  const pollUntilShipIsReady = async (abortSignal: AbortSignal) => {
    if (abortSignal.aborted) return false;
    // Get the ship and make sure ship_type is equal to host.
    // If not, poll until it is.
    const ship = await getByopShip();
    if (!ship) return false;

    if (ship.ship_type === 'provisional') {
      setTimeout(() => {
        if (!abortSignal.aborted) pollUntilShipIsReady(abortSignal);
      }, 1000);
    }

    return true;
  };

  const prepareSftpServer = async () => {
    const { token } = OnboardingStorage.get();
    if (!token) return false;

    const ship = await getByopShip();
    if (!ship) return false;

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
  };

  const pollUntilSftpIsReady = async (abortSignal: AbortSignal) => {
    if (abortSignal.aborted) return false;

    const ship = await getByopShip();
    if (!ship) return false;

    if (ship.ship_type.includes('dropletReady')) {
      const parts = ship.ship_type.split('|');
      const password = parts[2];
      const ipAddress = parts[3];
      setError(undefined);
      setSftpServer({ password, ipAddress });
      pollUntilUploaded(abortSignal);
    } else {
      // Continue polling until the SFTP server is ready.
      setTimeout(() => {
        if (!abortSignal.aborted) pollUntilSftpIsReady(abortSignal);
      }, 1000);
    }

    return true;
  };

  const pollUntilUploaded = async (abortSignal: AbortSignal) => {
    if (abortSignal.aborted) return false;

    const ship = await getByopShip();
    if (!ship) return false;

    if (ship.ship_type.includes('pierReceived')) {
      setError(undefined);
      goToPage('/booting', {
        product_type: 'byop-p',
      });
    } else {
      // Continue polling until the ship is uploaded.
      setTimeout(() => {
        if (!abortSignal.aborted) pollUntilUploaded(abortSignal);
      }, 5000);
    }

    return true;
  };

  const onBack = () => {
    goToPage('/account');
  };

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    pollUntilShipIsReady(signal)
      .then(() => prepareSftpServer())
      .then(() => pollUntilSftpIsReady(signal))
      .then(() => pollUntilUploaded(signal));

    return () => {
      // Stop all polling when the component unmounts.
      abortController.abort();
    };
  }, []);

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
