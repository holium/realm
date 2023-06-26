import { useEffect, useState } from 'react';

import {
  OnboardingStorage,
  uploadErrors,
  UploadIdDialog,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function UploadId() {
  const { goToPage } = useNavigation();

  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const { token } = OnboardingStorage.get();
    if (!token) return;
    thirdEarthApi.getUserShips(token).then((ships) => {
      if (
        ships.length === 1 &&
        ships[0].product_type === 'byop-p' &&
        ships[0].ship_type !== 'planet'
      ) {
        OnboardingStorage.set({
          productType: 'byop-p',
          provisionalShipId: ships[0].id.toString(),
        });
      }
    });
  }, []);

  const onUpload = async (file: File) => {
    const { token, provisionalShipId } = OnboardingStorage.get();

    if (!token || !provisionalShipId) return false;

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

    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('type', 'pier');
    formData.append('desks', 'false');
    formData.append('groups', 'false');

    const response = await thirdEarthApi.uploadPierFile(
      token,
      provisionalShipId,
      formData
    );

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
    return goToPage('/booting');
  };

  return (
    <Page title="Upload ID" isProtected>
      <UploadIdDialog
        fileName={file?.name}
        progress={progress}
        error={error}
        onUpload={onUpload}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}
