import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import {
  MOBILE_WIDTH,
  OnboardDialogDescription,
} from '../../components/OnboardDialog.styles';

export const GrayBox = styled(Flex)`
  padding: 16px;
  gap: 16px;
  background-color: rgba(var(--rlm-border-rgba), 0.5);
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: 12px;

  @media (max-width: ${MOBILE_WIDTH}px) {
    padding: 32px;
    .hideonmobile {
      display: none;
    }
  }
`;

export const InfoText = styled(OnboardDialogDescription)`
  font-size: 12px;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  opacity: 0.7;
`;
