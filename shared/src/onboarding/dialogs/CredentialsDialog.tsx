import styled from 'styled-components';

import { CopyButton, Flex, Text } from '@holium/design-system/general';

import { OnboardDialog } from '../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogSubTitle,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { CredentialsIcon } from '../icons/CredentialsIcon';

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(var(--rlm-window-rgba));
  filter: brightness(1.1);
  border-radius: 9px;
  padding: 16px;
`;

const InfoCardText = styled(Text.Body)`
  font-size: 14px;
  font-weight: 400;
  color: rgba(var(--rlm-text-rgba), 0.7);
`;

type Props = {
  credentials: {
    id: string;
    url: string;
    accessCode: string;
  };
  onNext: () => Promise<boolean>;
};

export const CredentialsDialog = ({ credentials, onNext }: Props) => (
  <OnboardDialog
    icon={<CredentialsIcon />}
    body={
      <Flex flexDirection="column" gap={16}>
        <OnboardDialogTitle>Credentials</OnboardDialogTitle>
        <OnboardDialogDescription>
          Save this information in case you want to connect to your identity
          from any other browser or device.
        </OnboardDialogDescription>
        <InfoCard>
          <Flex flexDirection="column" gap={4}>
            <OnboardDialogSubTitle fontWeight={600}>ID</OnboardDialogSubTitle>
            <InfoCardText>{credentials.id}</InfoCardText>
          </Flex>
          <Flex flexDirection="column" gap={4}>
            <OnboardDialogSubTitle fontWeight={600}>URL</OnboardDialogSubTitle>
            <InfoCardText>{credentials.url}</InfoCardText>
          </Flex>
          <Flex flexDirection="column" gap={4}>
            <OnboardDialogSubTitle fontWeight={600}>Code</OnboardDialogSubTitle>
            <InfoCardText>{credentials.accessCode}</InfoCardText>
          </Flex>
          <Flex mt={1}>
            <CopyButton
              content={[
                credentials.id,
                credentials.url,
                credentials.accessCode,
              ].join(' ')}
              label="Copy"
              size={16}
            />
          </Flex>
        </InfoCard>
      </Flex>
    }
    onNext={onNext}
  />
);
