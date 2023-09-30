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

  const getUnbootedByopShip = async () => {
    const { token } = OnboardingStorage.get();

    if (!token) {
      setError('Unathorized. Please log in again.');
      return false;
    }

    const ships = await thirdEarthApi.getUserShips(token);
    const byopShip = ships.find(
      (ship) => ship.product_type === 'byop-p' && ship.ship_type !== 'planet'
    );

    return byopShip;
  };

  const pollUntilShipIsReady = (abortSignal: AbortSignal): Promise<boolean> => {
    return new Promise((resolve) => {
      const asyncCheck = async () => {
        if (abortSignal.aborted) return resolve(false);

        const ship = await getUnbootedByopShip();
        if (!ship) {
          setError('No BYOP ship found.');
          return resolve(false);
        }

        if (ship.ship_type !== 'provisional') {
          return resolve(true);
        }

        setTimeout(() => asyncCheck(), 1000);
      };

      asyncCheck();
    });
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
    } catch (e) {
      setError('Failed to start SFTP upload.');
      console.error(e);
      return false;
    }

    return true;
  };

  const pollUntilSftpIsReady = (abortSignal: AbortSignal) => {
    return new Promise<boolean>((resolve) => {
      if (abortSignal.aborted) return resolve(false);

      getUnbootedByopShip().then((ship) => {
        if (!ship) return resolve(false);

        if (ship.ship_type.includes('dropletReady')) {
          const parts = ship.ship_type.split('|');
          const password = parts[2];
          const ipAddress = parts[3];
          setSftpServer({ password, ipAddress });
          return resolve(true);
        } else {
          setTimeout(() => {
            if (!abortSignal.aborted) {
              pollUntilSftpIsReady(abortSignal).then(() => resolve(true));
            } else {
              resolve(false);
            }
          }, 1000);
        }
      });
    });
  };

  const pollUntilUploaded = (abortSignal: AbortSignal) => {
    return new Promise<boolean>((resolve) => {
      if (abortSignal.aborted) return resolve(false);

      getUnbootedByopShip().then((ship) => {
        if (!ship) return resolve(false);

        if (ship.ship_type.includes('pierReceived')) {
          return resolve(true);
        } else {
          setTimeout(() => {
            if (!abortSignal.aborted) {
              pollUntilUploaded(abortSignal).then(() => resolve(true));
            } else {
              resolve(false);
            }
          }, 5000);
        }
      });
    });
  };

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    pollUntilShipIsReady(signal).then((shipReady) => {
      if (!shipReady) return false;

      return prepareSftpServer()
        .then(() => {
          return pollUntilSftpIsReady(signal);
        })
        .then((sftpReady) => {
          if (sftpReady) return false;

          return pollUntilUploaded(signal);
        })
        .then((uploaded) => {
          if (!uploaded) return false;

          setError(undefined);
          goToPage('/booting', {
            product_type: 'byop-p',
          });
          return true;
        });
    });

    return () => {
      // Stop all polling when the component unmounts.
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
