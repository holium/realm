import { ChatModelType } from 'renderer/stores/models/chat.model';

import { ChatRow } from '../../components/ChatRow/ChatRow';
import { StyledInboxRow, StyledInboxRowContainer } from './InboxRow.styles';

type InboxProps = {
  inbox: ChatModelType;
  isAdmin: boolean;
  isSelectedSpaceChat: boolean;
  isPinned: boolean;
  lastIsPinned?: boolean;
  nextIsPinned?: boolean;
  isStandaloneChat?: boolean;
  onClickInbox: (path: string) => void;
};

export const InboxRow = ({
  inbox,
  isAdmin,
  isSelectedSpaceChat,
  isPinned,
  lastIsPinned,
  nextIsPinned,
  isStandaloneChat,
  onClickInbox,
}: InboxProps) => {
  const topPinned = !lastIsPinned && isPinned;
  const bottomPinned = !nextIsPinned && isPinned;

  let className = 'chat-inbox-row-pinned';
  if (topPinned) {
    className = 'chat-inbox-row-top-pinned';
  } else if (bottomPinned) {
    className = 'chat-inbox-row-bottom-pinned';
  }

  return (
    <StyledInboxRowContainer
      isSelectedSpaceChat={!isStandaloneChat && isSelectedSpaceChat}
      className={className}
    >
      <StyledInboxRow className="chat-inbox-row">
        <ChatRow
          path={inbox.path}
          title={inbox.metadata.title}
          peers={inbox.peers.map((peer) => peer.ship)}
          isAdmin={isAdmin}
          type={inbox.type}
          invites={inbox.invites}
          timestamp={inbox.createdAt || inbox.metadata.timestamp}
          metadata={inbox.metadata}
          peersGetBacklog={inbox.peersGetBacklog}
          isStandaloneChat={isStandaloneChat}
          onClick={(evt) => {
            evt.stopPropagation();
            onClickInbox(inbox.path);
          }}
        />
      </StyledInboxRow>
    </StyledInboxRowContainer>
  );
};
