import styled from 'styled-components';

import {
  Card,
  Flex,
  scrollbarCss,
  scrollbarHoverCss,
} from '@holium/design-system/general';

interface CardStyleProps {
  isSelected: boolean;
}

export const WalletCardStyle = styled(Card)<CardStyleProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  padding: 12px;
  border-radius: 16px !important;
  box-shadow: var(--rlm-box-shadow-1) !important;
  background-color: rgba(var(--rlm-window-rgba));

  ${({ isSelected }) =>
    isSelected &&
    `
      flex: 1;
      gap: 10px;
    `}
`;

export const WalletCardBody = styled(Flex)`
  flex-direction: column;
  gap: inherit;
  overflow-y: auto;
  overflow-x: hidden;

  ${scrollbarCss}

  &:hover {
    ${scrollbarHoverCss}
  }
`;
