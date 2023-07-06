import { Flex, Text, WindowedList } from '@holium/design-system/general';

import { ChatModelType } from 'renderer/stores/models/chat.model';

import { InboxListContainer } from './InboxBody.styles';
import { InboxRow } from './InboxRow';

type Props = {
  inboxes: ChatModelType[];
  spacePath: string | undefined;
  isEmpty: boolean;
  isStandaloneChat: boolean;
  accountIdentity: string | undefined;
  isChatPinned: (path: string) => boolean;
  onClickInbox: (path: string) => void;
};

export const InboxBodyList = ({
  inboxes,
  isEmpty,
  isStandaloneChat,
  spacePath,
  accountIdentity,
  isChatPinned,
  onClickInbox,
}: Props) => {
  if (isEmpty) {
    return (
      <Flex
        flex={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={8}
        paddingLeft={isStandaloneChat ? 12 : 0}
      >
        <Text.Custom
          width={200}
          fontSize={3}
          fontWeight={500}
          textAlign="center"
          opacity={0.5}
        >
          No chats yet.
        </Text.Custom>
        <Text.Custom width={200} fontSize={3} textAlign="center" opacity={0.3}>
          Click the <b>+</b> to start.
        </Text.Custom>
      </Flex>
    );
  }

  return (
    <InboxListContainer isStandaloneChat={isStandaloneChat}>
      <WindowedList
        data={inboxes}
        shiftScrollbar={!isStandaloneChat}
        overscan={25}
        increaseViewportBy={{
          top: 400,
          bottom: 400,
        }}
        itemContent={(index, inbox) => {
          let lastIsPinned = false;
          let nextIsPinned = false;
          if (index > 0) {
            const prevInbox = inboxes[index - 1];
            if (isChatPinned(prevInbox.path)) {
              lastIsPinned = true;
            }
          }
          if (index < inboxes.length - 1) {
            const nextInbox = inboxes[index + 1];
            if (isChatPinned(nextInbox.path)) {
              nextIsPinned = true;
            }
          }

          return (
            <InboxRow
              key={`inbox-${inbox.path}-${index}`}
              inbox={inbox}
              isAdmin={accountIdentity ? inbox.isHost(accountIdentity) : false}
              isSelectedSpaceChat={inbox.metadata.space === spacePath}
              lastIsPinned={lastIsPinned}
              nextIsPinned={nextIsPinned}
              isPinned={isChatPinned(inbox.path)}
              isStandaloneChat={isStandaloneChat}
              onClickInbox={onClickInbox}
            />
          );
        }}
      />
    </InboxListContainer>
  );
};
