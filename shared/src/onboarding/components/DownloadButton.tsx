import { ReactNode } from 'react';
import styled from 'styled-components';
import { Button, Flex, Text } from '@holium/design-system';
import { MOBILE_WIDTH } from './OnboardDialog.styles';

const DownloadButtonStyled = styled(Button.Primary)`
  width: 154px;
  height: 32px;
  padding-left: 7px;
  padding-right: 7px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    width: 100%;
  }
`;

const DownloadText = styled(Text.Body)`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
`;

const DownloadHint = styled(DownloadText)`
  color: #ffffffb3;
`;

type Props = {
  icon: ReactNode;
  hint?: string;
  onClick: () => void;
};

export const DownloadButton = ({ icon, hint, onClick }: Props) => (
  <DownloadButtonStyled as="a" onClick={onClick}>
    <Flex flex={1} gap={10} alignItems="center">
      <Flex flex={1} gap={10} alignItems="center">
        {icon}
        <DownloadText>Download</DownloadText>
      </Flex>
      {hint && <DownloadHint>{hint}</DownloadHint>}
    </Flex>
  </DownloadButtonStyled>
);
