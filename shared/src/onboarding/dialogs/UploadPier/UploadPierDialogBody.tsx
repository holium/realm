import { Anchor, ErrorBox, Flex, InfoBox } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

type Props = {
  ipAddress: string;
  password: string;
  error?: string;
  hint?: string;
};

export const UploadPierDialogBody = ({
  ipAddress,
  password,
  error,
  hint,
}: Props) => (
  <Flex
    flexDirection="column"
    gap={16}
    marginBottom={30}
    maxWidth={550}
    alignSelf="center"
  >
    <OnboardDialogTitle>Upload Pier with SFTP</OnboardDialogTitle>
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
    <GrayBox>
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
          <OnboardDialogDescription
            style={{
              fontSize: 13,
            }}
          >
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
          <OnboardDialogDescription
            style={{
              fontSize: 13,
            }}
          >
            {password}
          </OnboardDialogDescription>
        </Flex>
      </Flex>
    </GrayBox>
    <Flex flexDirection="column" gap="2px">
      <OnboardDialogDescription>Planets only</OnboardDialogDescription>
      <OnboardDialogDescription>Max file size: 3 GB</OnboardDialogDescription>
    </Flex>
    {error && <ErrorBox>{error}</ErrorBox>}
    {hint && <InfoBox>{hint}</InfoBox>}
  </Flex>
);
