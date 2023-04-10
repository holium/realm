import { RefObject } from 'react';
import {
  Box,
  Text,
  WindowedList,
  WindowedListRef,
} from '@holium/design-system';
import { displayDate } from 'os/lib/time';
import { ChatMessage } from '../components/ChatMessage';
import { ChatMessageType, ChatModelType } from '../models';
import { Gallery } from 'react-photoswipe-gallery';

type Props = {
  listRef?: RefObject<WindowedListRef>;
  width: number;
  height: number;
  messages: ChatMessageType[];
  selectedChat: ChatModelType;
  ourColor: string;
};

export const ChatLogList = ({
  listRef,
  width,
  height,
  messages,
  selectedChat,
  ourColor,
}: Props) => {
  const renderChatRow = (index: number, row: ChatMessageType) => {
    const isLast = selectedChat ? index === messages.length - 1 : false;

    const isNextGrouped =
      index < messages.length - 1 && row.sender === messages[index + 1].sender;

    const isPrevGrouped =
      index > 0 &&
      row.sender === messages[index - 1].sender &&
      Object.keys(messages[index - 1].contents[0])[0] !== 'status';

    const topSpacing = isPrevGrouped ? '3px' : 2;
    const bottomSpacing = isNextGrouped ? '3px' : 2;

    const thisMsgDate = new Date(row.createdAt).toDateString();
    const prevMsgDate =
      messages[index - 1] &&
      new Date(messages[index - 1].createdAt).toDateString();
    const showDate = index === 0 || thisMsgDate !== prevMsgDate;

    return (
      <Box
        key={row.id}
        mx="1px"
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
        itemContent={renderChatRow}
        chatMode
        shiftScrollbar
      />
    </Gallery>
  );
};
