import { ChatModelType } from 'renderer/stores/models/chat.model';

import { ChatRow } from '../../components/ChatRow/ChatRow';
import { StyledInboxRow, StyledInboxRowContainer } from './InboxRow.styles';

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
}: InboxProps) => (
  <StyledInboxRowContainer isSelectedSpaceChat={isSelectedSpaceChat}>
    <StyledInboxRow
      isPinned={isPinned}
      layout="preserve-aspect"
      layoutId={isStandaloneChat ? undefined : `chat-${inbox.path}-container`}
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
);
