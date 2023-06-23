import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

export const InboxListContainer = styled(Flex)<{ isStandaloneChat: boolean }>`
  flex: 1;

  .chat-inbox-row-top-pinned {
    .chat-inbox-row {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }
  }
  .chat-inbox-row-pinned {
    .chat-inbox-row {
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }
  }
  .chat-inbox-row-bottom-pinned {
    .chat-inbox-row {
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }

  ${({ isStandaloneChat }) =>
    isStandaloneChat &&
    `
    padding-left: 12px;
  `}
`;

export const InboxBodyHeaderContainer = styled(Flex)<{
  isStandaloneChat?: boolean;
}>`
  align-items: center;
  z-index: 1;
  padding: 0 0 8px 4px;

  ${({ isStandaloneChat }) =>
    isStandaloneChat &&
    `
    height: 58px;
    padding: 12px 12px 12px 24px;
  `}
`;
