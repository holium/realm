import { RefObject, useState } from 'react';
import { Gallery } from 'react-photoswipe-gallery';

import {
  Box,
  Text,
  WindowedList,
  WindowedListRef,
} from '@holium/design-system/general';

import { displayDate } from 'os/lib/time';

import { ChatMessageType } from '../../../../stores/models/chat.model';
import { ChatMessage } from '../../components/ChatMessage';

type Props = {
  listRef: RefObject<WindowedListRef>;
  messages: ChatMessageType[];
  ourColor: string;
  isStandaloneChat: boolean;
  topOfListPadding?: number;
};

export const ChatLogList = ({
  listRef,
  messages: unfilteredMessages,
  ourColor,
  topOfListPadding,
  isStandaloneChat,
}: Props) => {
  const [prevHeight, setPrevHeight] = useState<number>(0);

  // Filter out duplicate messages
  const messages = unfilteredMessages.filter((msg, index) => {
    if (index === 0) return true;
    const prevMsg = unfilteredMessages[index - 1];
    if (msg.id === prevMsg.id) return false;
    return true;
  });

  const renderChatRow = (index: number, message: ChatMessageType) => {
    const isLast = index === messages.length - 1;
    const isNextGrouped =
      index < messages.length - 1 &&
      message.sender === messages[index + 1].sender;

    const isPrevGrouped =
      index > 0 &&
      message.sender === messages[index - 1].sender &&
      Object.keys(messages[index - 1].contents[0])[0] !== 'status';

    // we need to use 3px here because numbers are increments of 4px -- so 3 is 12px actually
    let topSpacing = isPrevGrouped ? '3px' : 2;
    const bottomSpacing = isLast ? (isNextGrouped ? '3px' : 2) : 0;

    const thisMsgDate = new Date(message.createdAt).toDateString();
    const prevMsgDate =
      messages[index - 1] &&
      new Date(messages[index - 1].createdAt).toDateString();
    const showDate = index === 0 || thisMsgDate !== prevMsgDate;

    if (index === 0 && topOfListPadding) {
      topSpacing = topOfListPadding;
    }

    return (
      <Box
        key={`${index}-${message.id}-${message.createdAt}-${message.updatedAt}`}
        animate={false}
        pt={topSpacing}
        pb={bottomSpacing}
      >
        {showDate && (
          <Text.Custom
            opacity={0.5}
            fontSize="12px"
            fontWeight={500}
            textAlign="center"
            mt={2}
            mb={2}
          >
            {displayDate(message.createdAt)}
          </Text.Custom>
        )}
        <ChatMessage
          isPrevGrouped={isPrevGrouped}
          isNextGrouped={isNextGrouped}
          message={message as ChatMessageType}
          ourColor={ourColor}
          onReplyClick={(replyId) => {
            const replyIndex = messages.findIndex((msg) => msg.id === replyId);
            if (replyIndex === -1) return;
            listRef?.current?.scrollToIndex({
              index: replyIndex,
              align: 'start',
              behavior: 'smooth',
            });
          }}
        />
      </Box>
    );
  };

  return (
    <Gallery>
      <WindowedList
        // Fixes a bug where the list is blank until scrolled.
        key={messages.length === 0 ? 'empty' : 'not-empty'}
        innerRef={listRef}
        data={messages}
        atBottomThreshold={100}
        increaseViewportBy={isStandaloneChat ? 600 : 250}
        totalListHeightChanged={(height: number) => {
          if (height - prevHeight === 10) {
            // 10 px is the height change that occurs when there's a reaction added
            listRef?.current?.scrollBy({
              top: 10,
            });
          }
          setPrevHeight(height);
        }}
        itemContent={renderChatRow}
        chatMode
        shiftScrollbar={!isStandaloneChat}
      />
    </Gallery>
  );
};
