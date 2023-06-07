import { useMemo } from 'react';
import styled from 'styled-components';

import { Box } from '@holium/design-system/general';

import { ChatModelType } from 'renderer/stores/models/chat.model';

import { ChatRow } from '../../components/ChatRow';

const StyledInboxRowContainer = styled(Box)<{ isSelectedSpaceChat: boolean }>`
  ${({ isSelectedSpaceChat }) =>
    isSelectedSpaceChat &&
    `
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(var(--rlm-border-rgba), 0.8);
  `}
`;

const StyledInboxRow = styled(Box)<{ isSpace: boolean; isPinned: boolean }>`
  width: 100%;
  align-items: center;
  z-index: 2;

  height: ${({ isSpace }) => (isSpace ? 70 : 52)}px;

  ${({ isPinned }) =>
    isPinned &&
    `
    background: var(--rlm-overlay-hover-color);
  `}
`;

type InboxProps = {
  inbox: ChatModelType;
  isAdmin: boolean;
  isSelectedSpaceChat: boolean;
  isPinned: boolean;
  isStandaloneChat?: boolean;
  onClickInbox: (path: string) => void;
};

export const InboxRow = ({
  inbox,
  isAdmin,
  isSelectedSpaceChat,
  isPinned,
  isStandaloneChat,
  onClickInbox,
}: InboxProps) => {
  return useMemo(
    () => (
      <StyledInboxRowContainer isSelectedSpaceChat={isSelectedSpaceChat}>
        <StyledInboxRow
          isSpace={inbox.type === 'space'}
          isPinned={isPinned}
          layout="preserve-aspect"
          layoutId={
            isStandaloneChat ? undefined : `chat-${inbox.path}-container`
          }
        >
          <ChatRow
            path={inbox.path}
            title={inbox.metadata.title}
            peers={inbox.peers.map((peer) => peer.ship)}
            isAdmin={isAdmin}
            type={inbox.type}
            timestamp={inbox.createdAt || inbox.metadata.timestamp}
            metadata={inbox.metadata}
            peersGetBacklog={inbox.peersGetBacklog}
            muted={inbox.muted}
            isStandaloneChat={isStandaloneChat}
            onClick={(evt) => {
              evt.stopPropagation();
              onClickInbox(inbox.path);
            }}
          />
        </StyledInboxRow>
      </StyledInboxRowContainer>
    ),
    [inbox.lastMessage]
  );
};
