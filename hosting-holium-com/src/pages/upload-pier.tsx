import { useState } from 'react';

import {
  OnboardingStorage,
  uploadErrors,
  UploadPierDialog,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function UploadPierPage() {
  const { goToPage } = useNavigation();

  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>();

  const onUpload = async (file: File) => {
    const { token } = OnboardingStorage.get();

    if (!token) {
      setError('Unathorized. Please log in again.');
      return false;
    }

    // Get provisional ship ID.
    const ships = await thirdEarthApi.getUserShips(token);
    const provisionalShip = ships.find((ship) => ship.ship_type === 'host');

    if (!provisionalShip) {
      console.log('ships', JSON.stringify(ships, null, 2));
      setError('No provisional ship found.');
      return false;
    }

    const provisionalShipId = provisionalShip.id.toString();

    setFile(file);
    setProgress(0);
    setError(undefined);

    // Increment progress by 1% every 2s until 99%.
    const interval = setInterval(() => {
      setProgress((progress) => {
        if (progress === undefined) return 0;

        if (progress < 99) {
          return progress + 1;
        } else {
          clearInterval(interval);
          return progress;
        }
      });
    }, 2000);

    await thirdEarthApi.log(token, {
      file: 'purchases',
      type: 'info',
      subject: 'FRONTEND: SFTP started (email notify)',
      message: `Upload with SFTP started.`,
    });
    const response = await thirdEarthApi.uploadUploadPier(
      token,
      provisionalShipId
    );

    console.log('SFTP response', response);

    setHint(undefined);

    if (!response) {
      setError('An unknown error occurred.');

      return false;
    }

    if (
      response.ship_type &&
      Object.keys(uploadErrors).includes(response.ship_type)
    ) {
      setError(uploadErrors[response.ship_type]);

      return false;
    }

    setProgress(100);
    clearInterval(interval);

    return true;
  };

  const onBack = () => {
    goToPage('/account');
  };

  const onNext = () => {
    return goToPage('/booting', {
      product_type: 'byop-p',
    });
  };

  return (
    <Page title="Upload Pier" isProtected>
      <UploadPierDialog
        fileName={file?.name}
        progress={progress}
        error={error}
        hint={hint}
        onUpload={onUpload}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}
