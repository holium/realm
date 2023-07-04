import { useFormikContext } from 'formik';

import { Anchor, ErrorBox, Flex, InfoBox } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { UploadBox } from './UploadBox';

type UploadIdFields = {
  uploaded: boolean;
  uploading: boolean;
};

type Props = {
  fileName?: string;
  progress?: number;
  error?: string;
  hint?: string;
  onUpload: (file: File) => Promise<boolean>;
};

export const UploadIdDialogBody = ({
  fileName,
  progress,
  error,
  hint,
  onUpload,
}: Props) => {
  const {
    values: { uploaded, uploading },
    setFieldValue,
  } = useFormikContext<UploadIdFields>();

  const handleUpload = async (file: File) => {
    if (uploading || uploaded) return;

    setFieldValue('uploading', true);

    const result = await onUpload(file);

    if (result) setFieldValue('uploaded', true);

    setFieldValue('uploading', false);
  };

  return (
    <Flex
      flexDirection="column"
      gap={16}
      marginBottom={30}
      maxWidth={550}
      alignSelf="center"
    >
      <OnboardDialogTitle>Upload ID</OnboardDialogTitle>
      <OnboardDialogDescription>
        Upload a compressed archive of your existing pier in a <code>.zip</code>{' '}
        or <code>.tar.gz</code> format which was created after the ship was shut
        down at its current location.
      </OnboardDialogDescription>
      <OnboardDialogDescription>
        Read{' '}
        <Anchor
          href="https://docs.holium.com/realm/hosting/byop-pier"
          target="_blank"
        >
          <u>our guide</u>
        </Anchor>{' '}
        to learn more.
      </OnboardDialogDescription>
      <UploadBox
        fileName={fileName}
        progress={progress}
        onUpload={handleUpload}
      />
      <Flex flexDirection="column" gap="2px">
        <OnboardDialogDescription>Planets only</OnboardDialogDescription>
        <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
      </Flex>
      {error && <ErrorBox>{error}</ErrorBox>}
      {hint && <InfoBox>{hint}</InfoBox>}
    </Flex>
  );
};
