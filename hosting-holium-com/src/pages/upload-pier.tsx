import { useEffect, useState } from 'react';

import { useToggle } from '@holium/design-system/util';
import {
  OnboardingStorage,
  uploadErrors,
  UploadPierDialog,
} from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

type SftpServer = {
  ipAddress: string;
  password: string;
};

export default function UploadPierPage() {
  const { goToPage } = useNavigation();

  const uploaded = useToggle(false);

  const [sftpServer, _setSftpServer] = useState<SftpServer>();

  const [error, setError] = useState<string>();

  const onUpload = async () => {
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

    setError(undefined);

    await thirdEarthApi.log(token, {
      file: 'purchases',
      type: 'info',
      subject: 'FRONTEND: SFTP started (email notify)',
      message: `Upload with SFTP started.`,
    });
    const response = await thirdEarthApi.prepareSftpServerForPierUpload(
      token,
      provisionalShipId
    );

    console.log('SFTP response', response);

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

  useEffect(() => {
    if (sftpServer) {
      // Poll.
    } else {
      onUpload();
    }
  }, []);

  return (
    <Page title="Upload Pier with SFTP" isProtected>
      <UploadPierDialog
        password={sftpServer?.password}
        ipAddress={sftpServer?.ipAddress}
        error={error}
        uploaded={uploaded.isOn}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}
