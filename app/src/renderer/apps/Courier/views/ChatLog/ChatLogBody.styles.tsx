import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

import { Box, Flex } from '@holium/design-system/general';

export const FullWidthAnimatePresence = styled(AnimatePresence)`
  position: absolute;
  z-index: 16;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
`;

export const ChatInputContainer = styled(Box)<{ isStandaloneChat: boolean }>`
  width: 100%;

  ${({ isStandaloneChat }) =>
    isStandaloneChat &&
    `
      padding: 11px 12px 12px 12px;
      background: var(--rlm-window-color);
      border-top: 1px solid var(--rlm-base-color);
  `}
`;

export const ChatLogListContainer = styled(Flex)<{ isStandaloneChat: boolean }>`
  position: relative;
  flex: 1;
  flex-direction: column;
  width: 100%;
  padding: ${({ isStandaloneChat }) => (isStandaloneChat ? '0 0 0 12px' : '0')};
`;
