import { useEffect, useState } from 'react';

import { ErrorBox, Flex } from '@holium/design-system/general';

import { GrayButton } from '../../components/ChangeButton';
import { OnboardDialogDescription } from '../../onboarding';

// These errors are stored as the ship_type of the associated ship row in the database.
export const uploadErrors: Record<string, string> = {
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

type Props = {
  shipType?: string;
  onClickReuploadId: () => void;
};

export const AccountUnfinishedUploadDialogBody = ({
  shipType,
  onClickReuploadId,
}: Props) => {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (shipType && Object.keys(uploadErrors).includes(shipType)) {
      setError(uploadErrors[shipType]);
    } else if (shipType === 'hardError') {
      setError('Something went wrong with your upload.');
    }
  }, [shipType]);

  if (error) {
    return (
      <>
        <ErrorBox>{error}</ErrorBox>
        <Flex flexDirection="column" alignItems="center">
          <GrayButton onClick={onClickReuploadId}>Re-upload</GrayButton>
        </Flex>
      </>
    );
  }

  if (shipType === 'host') {
    return (
      <>
        <OnboardDialogDescription>
          You haven't uploaded your pier yet.
        </OnboardDialogDescription>
        <Flex flexDirection="column" alignItems="center">
          <GrayButton onClick={onClickReuploadId}>Continue workflow</GrayButton>
        </Flex>
      </>
    );
  }

  return (
    <OnboardDialogDescription>
      Your identity is being created. Please wait.
    </OnboardDialogDescription>
  );
};
