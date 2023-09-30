import { Anchor, ErrorBox, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

type Props = {
  ipAddress?: string;
  password?: string;
  error?: string;
};

export const UploadPierDialogBody = ({ ipAddress, password, error }: Props) => (
  <Flex
    flexDirection="column"
    gap={16}
    marginBottom={30}
    maxWidth={550}
    alignSelf="center"
  >
    <OnboardDialogTitle>Upload Pier with SFTP</OnboardDialogTitle>
    <OnboardDialogDescription>
      Upload a compressed archive of your existing pier to the SFTP server. This
      page will automatically redirect once the upload is complete.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      Read the{' '}
      <Anchor
        href="https://docs.holium.com/realm/hosting/upload-pier-with-sftp"
        target="_blank"
      >
        <u>SFTP guide</u>
      </Anchor>{' '}
      step-by-step instructions.
    </OnboardDialogDescription>
    <GrayBox style={{ minHeight: 81, alignItems: 'center' }}>
      {ipAddress && password ? (
        <Flex flexDirection="column" gap="8px">
          <Flex gap="8px" alignItems="center">
            <OnboardDialogDescription
              style={{
                fontSize: 12,
                fontWeight: 500,
                opacity: 0.7,
                width: 100,
              }}
            >
              IP Address
            </OnboardDialogDescription>
            <OnboardDialogDescription style={{ fontSize: 13 }}>
              {ipAddress}
            </OnboardDialogDescription>
          </Flex>
          <Flex gap="8px" alignItems="center">
            <OnboardDialogDescription
              style={{
                fontSize: 12,
                fontWeight: 500,
                opacity: 0.7,
                width: 100,
              }}
            >
              Password
            </OnboardDialogDescription>
            <OnboardDialogDescription style={{ fontSize: 13 }}>
              {password}
            </OnboardDialogDescription>
          </Flex>
        </Flex>
      ) : (
        <OnboardDialogDescription
          style={{ fontSize: 13, flex: 1, textAlign: 'center' }}
        >
          Preparing SFTP (this may take a minute)...
        </OnboardDialogDescription>
      )}
    </GrayBox>
    <Flex flexDirection="column" gap="2px">
      <OnboardDialogDescription>Planets only</OnboardDialogDescription>
      <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
    </Flex>
    {error && <ErrorBox>{error}</ErrorBox>}
  </Flex>
);
