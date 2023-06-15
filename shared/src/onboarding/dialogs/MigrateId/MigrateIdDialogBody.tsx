import { Anchor, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { UploadBox } from './UploadBox';

type Props = {
  fileName?: string;
  progress?: number;
  onUpload: (file: File) => void;
  onClickClearUpload: () => void;
};

export const MigrateIdDialogBody = ({
  fileName,
  progress,
  onUpload,
  onClickClearUpload,
}: Props) => (
  <Flex
    flexDirection="column"
    gap={16}
    marginBottom={30}
    maxWidth={550}
    alignSelf="center"
  >
    <OnboardDialogTitle>Migrate an ID</OnboardDialogTitle>
    <OnboardDialogDescription>
      This option is for people who want to move their existing ship with all of
      its apps, subscriptions, and configurations to Holium hosting.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      <b>Requires:</b> A compressed archive of your existing pier in a .zip or
      .tar.gz format which was created after the ship was shut down at its
      current location.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      Check out{' '}
      <Anchor href="https://docs.holium.com/realm/hosting/byop-pier">
        <u>our guide</u>
      </Anchor>{' '}
      for more info!
    </OnboardDialogDescription>
    <UploadBox
      fileName={fileName}
      progress={progress}
      onUpload={onUpload}
      onClickClearUpload={onClickClearUpload}
    />
    <Flex flexDirection="column" gap="4px">
      <OnboardDialogDescription>Planets only</OnboardDialogDescription>
      <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
    </Flex>
  </Flex>
);