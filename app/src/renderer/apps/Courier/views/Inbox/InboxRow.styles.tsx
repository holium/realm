import styled from 'styled-components';

import { Box } from '@holium/design-system/general';

export const StyledInboxRowContainer = styled(Box)<{
  isSelectedSpaceChat: boolean;
}>`
  min-width: 0;

  ${({ isSelectedSpaceChat }) =>
    isSelectedSpaceChat &&
    `
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(var(--rlm-border-rgba), 0.8);
  `}
`;

export const StyledInboxRow = styled(Box)<{
  isSpace: boolean;
  isPinned: boolean;
}>`
  width: 100%;
  min-width: 0;
  align-items: center;
  z-index: 2;

  ${({ isPinned }) =>
    isPinned &&
    `
    background: var(--rlm-overlay-hover-color);
  `}
`;
