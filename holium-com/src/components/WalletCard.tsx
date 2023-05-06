import styled from 'styled-components';

import { Box, BoxProps } from '@holium/design-system/general';

export const WalletCardStyle = styled(Box)<BoxProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px 12px;
  transition: box-shadow 0.1s ease;
  border-radius: 12px !important;
  border: 1px solid var(--rlm-border-color);
  background: var(--rlm-window-bg);
  &:hover {
    transition: box-shadow 0.25s ease;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12);
  }
  filter: brightness(120%);
`;
