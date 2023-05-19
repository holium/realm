import styled from 'styled-components';

import { Card } from '@holium/design-system/general';

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
  transition: box-shadow 0.1s ease;
  border-radius: 16px !important;
  transition: box-shadow 0.25s ease;
  box-shadow: var(--rlm-box-shadow-1) !important;
  background-color: rgba(var(--rlm-window-rgba));
  overflow-y: auto;

  ${({ isSelected }) =>
    isSelected &&
    `
      flex: 1;
      gap: 10px;
    `}
`;
