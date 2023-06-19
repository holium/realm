import { useState } from 'react';

import { OnboardingStorage, UploadIdDialog } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

// These errors are stored as the ship_type of the associated ship row in the database.
const uploadErrors: Record<string, string> = {
  invalidFileError:
    'The uploaded .tar.gz or .zip file failed to be decompressed.',
  invalidFileFormatError:
    'Pier directory was not found after unzipping uploaded file.',
  invalidPierError: 'Unpacked pier directory is not a valid/bootable pier.',
  dropletTimeout:
    'The customer did not upload their pier within the 1 hour time limit.',
  tooManyFiles:
    'More files were uploaded other than the compressed pier and done.file.',
  uploadError:
    'File failed to be uploaded (web upload only, so this is UNUSED).',
  dbInsertionError:
    "Failed to create an associated row in the 'planets' table.",
};

export default function UploadId() {
  const { goToPage } = useNavigation();

  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();

  const onUpload = async (file: File) => {
    const { token, email, serverId, provisionalShipId } =
      OnboardingStorage.get();

    if (!token || !serverId || !email || !provisionalShipId) return false;

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

  const onBack = () => goToPage('/account/get-realm');

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
