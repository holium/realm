import { Box } from '@holium/design-system/general';

import { ChatModelType } from 'renderer/stores/models/chat.model';

import { ChatRow } from '../../components/ChatRow';

type InboxProps = {
  inbox: ChatModelType;
  isAdmin: boolean;
  isLast: boolean;
  isSelectedSpaceChat: boolean;
  isPinned: boolean;
  onClickInbox: (path: string) => void;
};

export const InboxRow = ({
  inbox,
  isAdmin,
  isLast,
  isSelectedSpaceChat,
  isPinned,
  onClickInbox,
}: InboxProps) => {
  const height = inbox.type === 'space' ? 70 : 52;

  let customStyle = {};
  let outerStyle = {};

  if (isSelectedSpaceChat) {
    outerStyle = {
      paddingBottom: 8,
      height: height + 8,
      marginBottom: 8,
      borderBottom: '1px solid rgba(var(--rlm-border-rgba), 0.8)',
    };
    customStyle = {
      borderRadius: 6,
    };
  } else if (isPinned) {
    outerStyle = {
      height,
    };
    customStyle = {
      borderRadius: 6,
      height,
      background: 'var(--rlm-overlay-hover-color)',
    };
  } else if (isLast) {
    outerStyle = {
      height: height + 16,
      paddingBottom: 16,
    };
  } else {
    outerStyle = {
      height,
    };
  }

  return (
    <Box style={outerStyle}>
      <Box
        width="100%"
        zIndex={2}
        layout="preserve-aspect"
        alignItems="center"
        layoutId={`chat-${inbox.path}-container`}
        style={customStyle}
      >
        <ChatRow
          height={height}
          path={inbox.path}
          title={inbox.metadata.title}
          peers={inbox.peers.map((peer) => peer.ship)}
          isAdmin={isAdmin}
          type={inbox.type}
          timestamp={inbox.createdAt || inbox.metadata.timestamp}
          metadata={inbox.metadata}
          peersGetBacklog={inbox.peersGetBacklog}
          muted={inbox.muted}
          onClick={(evt) => {
            evt.stopPropagation();
            onClickInbox(inbox.path);
          }}
        />
      </Box>
    </Box>
  );
};
