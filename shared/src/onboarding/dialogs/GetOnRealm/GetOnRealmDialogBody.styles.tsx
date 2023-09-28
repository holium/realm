import styled, { css } from 'styled-components';

import { Button, Flex, Text } from '@holium/design-system/general';

import { GrayButton } from '../../components/ChangeButton';
import { MOBILE_WIDTH } from '../../components/OnboardDialog.styles';

export const ButtonsContainer = styled(Flex)`
  flex: 1;
  gap: 12px;
`;

const CTAButtonCSS = css`
  width: 200px;
  height: 36px;
  justify-content: center;

  @media (max-width: ${MOBILE_WIDTH}px) {
    flex: 1;
  }
`;

export const PurchaseIdButton = styled(Button.Primary)`
  ${CTAButtonCSS}
`;

export const UploadPierButton = styled(GrayButton)`
  ${CTAButtonCSS}
`;

export const ButtonText = styled(Text.Body)`
  font-weight: 500;
  color: inherit;
  margin: 2px;
`;
