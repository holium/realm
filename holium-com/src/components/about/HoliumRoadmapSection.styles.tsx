import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

export const TIMELINE_WIDTH = 750;

export const TimelineContainer = styled(Flex)`
  position: relative;
  width: 100%;
  max-width: 390px;
  padding: 24px;
  gap: 32px;
  flex-direction: column;
  border-right: 1px solid var(--rlm-icon-color);

  @media (min-width: ${TIMELINE_WIDTH}px) {
    transform: translateX(calc(-50%));
  }
`;

export const TobeContinuedBorder = styled.div`
  width: 100%;
  max-width: 390px;
  padding: 24px;
  border-right: 1px dashed var(--rlm-icon-color);

  @media (min-width: ${TIMELINE_WIDTH}px) {
    transform: translateX(calc(-50%));
  }
`;

export const DateText = styled(Text.Body)`
  text-align: right;
  color: var(--rlm-icon-color);
`;

export const DateDot = styled.div`
  position: absolute;
  top: 0;
  right: ${-10 - 24}px;
  width: 19px;
  height: 19px;
  background: #6e6e6d;
  border-radius: 50%;
`;
