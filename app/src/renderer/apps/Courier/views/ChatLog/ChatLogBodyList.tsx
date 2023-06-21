import { RefObject } from 'react';

import { Text, WindowedListRef } from '@holium/design-system/general';

import { ChatMessageType } from 'renderer/stores/models/chat.model';

import { PinnedContainer } from '../../components/PinnedMessage';
import {
  ChatLogListContainer,
  FullWidthAnimatePresence,
} from './ChatLogBody.styles';
import { ChatLogList } from './ChatLogList';

type Props = {
  messages: ChatMessageType[];
  listRef: RefObject<WindowedListRef>;
  topPadding: number;
  ourColor: string;
  showPin: boolean;
  pinnedChatMessage: ChatMessageType | null | undefined;
  isStandaloneChat: boolean;
  isEmpty: boolean;
  isLoaded: boolean;
};

export const ChatLogBodyList = ({
  messages,
  listRef,
  topPadding,
  ourColor,
  showPin,
  isEmpty,
  isLoaded,
  isStandaloneChat,
  pinnedChatMessage,
}: Props) => {
  if (isEmpty && isLoaded) {
    return (
      <Text.Custom textAlign="center" width={300} fontSize={3} opacity={0.5}>
        You haven't sent or received any messages in this chat yet.
      </Text.Custom>
    );
  }

  return (
    <ChatLogListContainer isStandaloneChat={isStandaloneChat}>
      {showPin && pinnedChatMessage && (
        <FullWidthAnimatePresence>
          <PinnedContainer
            message={pinnedChatMessage}
            onClick={() => {
              const index = messages.findIndex(
                (msg) => msg.id === pinnedChatMessage.id
              );
              listRef?.current?.scrollToIndex({
                index,
                align: 'start',
                behavior: 'smooth',
              });
            }}
          />
        </FullWidthAnimatePresence>
      )}
      <ChatLogList
        listRef={listRef}
        messages={messages}
        topOfListPadding={topPadding}
        ourColor={ourColor}
        isStandaloneChat={isStandaloneChat}
      />
    </ChatLogListContainer>
  );
};
