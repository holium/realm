import { RefObject, useState } from 'react';
import { Gallery } from 'react-photoswipe-gallery';
import {
  Box,
  Text,
  WindowedList,
  WindowedListRef,
} from '@holium/design-system';
import { displayDate } from 'os/lib/time';

import {
  ChatMessageType,
  ChatModelType,
} from '../../../stores/models/chat.model';
import { ChatMessage } from '../components/ChatMessage';

type Props = {
  listRef: RefObject<WindowedListRef>;
  width: number;
  height: number;
  messages: ChatMessageType[];
  selectedChat: ChatModelType;
  ourColor: string;
  endOfListPadding?: number;
  topOfListPadding?: number;
};

export const ChatLogList = ({
  listRef,
  width,
  height,
  messages,
  selectedChat,
  ourColor,
  endOfListPadding,
  topOfListPadding,
}: Props) => {
  const [prevHeight, setPrevHeight] = useState<number>(0);

  const renderChatRow = (index: number, row: ChatMessageType) => {
    const isLast = selectedChat ? index === messages.length - 1 : false;
    const isNextGrouped =
      index < messages.length - 1 && row.sender === messages[index + 1].sender;

    const isPrevGrouped =
      index > 0 &&
      row.sender === messages[index - 1].sender &&
      Object.keys(messages[index - 1].contents[0])[0] !== 'status';

    let topSpacing = isPrevGrouped ? '3px' : 2;
    let bottomSpacing = isNextGrouped ? '3px' : 2;

    const thisMsgDate = new Date(row.createdAt).toDateString();
    const prevMsgDate =
      messages[index - 1] &&
      new Date(messages[index - 1].createdAt).toDateString();
    const showDate = index === 0 || thisMsgDate !== prevMsgDate;
    if (index === messages.length - 1 && endOfListPadding) {
      bottomSpacing = endOfListPadding;
    }

    if (index === 0 && topOfListPadding) {
      topSpacing = topOfListPadding;
    }

    return (
      <Box
        key={row.id}
        mx="1px"
        animate={false}
        pt={topSpacing}
        pb={isLast ? bottomSpacing : 0}
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
            {displayDate(row.createdAt)}
          </Text.Custom>
        )}
        <ChatMessage
          isPrevGrouped={isPrevGrouped}
          isNextGrouped={isNextGrouped}
          containerWidth={width}
          message={row as ChatMessageType}
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
        innerRef={listRef}
        data={messages}
        width={width}
        height={height}
        atBottomThreshold={100}
        followOutput={true}
        increaseViewportBy={{
          top: 200,
          bottom: 200,
        }}
        alignToBottom
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
        shiftScrollbar
      />
    </Gallery>
  );
};
