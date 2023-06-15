import { Anchor, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { UploadBox } from './UploadBox';

type Props = {
  fileName?: string;
  progress?: number;
  onClickClearUpload: () => void;
};

export const MigrateIdDialogBody = ({
  fileName,
  progress,
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
      <Anchor>
        <u>our guide</u>
      </Anchor>{' '}
      for more info!
    </OnboardDialogDescription>
    <UploadBox
      fileName={fileName}
      progress={progress}
      setFile={() => {}}
      onClickClearUpload={onClickClearUpload}
    />
    <Flex flexDirection="column" gap="4px">
      <OnboardDialogDescription>Planets only</OnboardDialogDescription>
      <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
    </Flex>
  </Flex>
);
