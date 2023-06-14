import styled from 'styled-components';

import { Anchor, Flex, Icon } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

const UploadBox = styled(GrayBox)`
  gap: 0;
  height: 80px;
  align-items: center;
  justify-content: center;
  border-style: dashed;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 10px;
  padding: 1px;
  background-color: rgba(var(--rlm-border-rgba), 0.9);
  border-radius: 36px;
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    width: ${({ progress }) => progress}%;
    height: 8px;
    background-color: var(--rlm-accent-color);
    border-radius: 36px;
  }
`;

type Props = {
  fileName?: string;
  progress?: number;
};

export const MigrateIdDialogBody = ({ fileName, progress }: Props) => (
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
    <UploadBox>
      {fileName && progress !== undefined ? (
        <Flex flex={1} flexDirection="column" gap="2px">
          <Flex gap="4px">
            {progress === 100 && <Icon name="CheckCircle" />}
            <OnboardDialogDescription
              style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}
            >
              {fileName}
            </OnboardDialogDescription>
          </Flex>
          <Flex width="100%" height="100%" alignItems="center" gap="8px">
            <ProgressBar progress={progress} />
            <OnboardDialogDescription>{progress}%</OnboardDialogDescription>
          </Flex>
        </Flex>
      ) : (
        <OnboardDialogDescription style={{ fontSize: 13 }}>
          Drag and drop pier or <u>click here</u>
        </OnboardDialogDescription>
      )}
    </UploadBox>
    <Flex flexDirection="column" gap="4px">
      <OnboardDialogDescription>Planets only</OnboardDialogDescription>
      <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
    </Flex>
  </Flex>
);
