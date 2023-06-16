import { useFormikContext } from 'formik';

import { Anchor, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { UploadBox } from './UploadBox';

type MigrateIdFields = {
  uploaded: boolean;
  uploading: boolean;
};

type Props = {
  fileName?: string;
  progress?: number;
  onUpload: (file: File) => Promise<boolean>;
};

export const MigrateIdDialogBody = ({
  fileName,
  progress,
  onUpload,
}: Props) => {
  const {
    values: { uploaded, uploading },
    setFieldValue,
  } = useFormikContext<MigrateIdFields>();

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
      <OnboardDialogTitle>Migrate an ID</OnboardDialogTitle>
      <OnboardDialogDescription>
        This option is for people who want to move their existing ship with all
        of its apps, subscriptions, and configurations to Holium hosting.
      </OnboardDialogDescription>
      <OnboardDialogDescription>
        <b>Requires:</b> A compressed archive of your existing pier in a .zip or
        .tar.gz format which was created after the ship was shut down at its
        current location.
      </OnboardDialogDescription>
      <OnboardDialogDescription>
        Check out{' '}
        <Anchor
          href="https://docs.holium.com/realm/hosting/byop-pier"
          target="_blank"
        >
          <u>our guide</u>
        </Anchor>{' '}
        for more info!
      </OnboardDialogDescription>
      <UploadBox
        fileName={fileName}
        progress={progress}
        onUpload={handleUpload}
      />
      <Flex flexDirection="column" gap="4px">
        <OnboardDialogDescription>Planets only</OnboardDialogDescription>
        <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
      </Flex>
    </Flex>
  );
};
