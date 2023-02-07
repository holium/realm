import { useMemo } from 'react';
import { Flex, WindowedList } from '@holium/design-system';
import { ShipModelType } from 'os/services/ship/models/ship';
import { GraphDMType } from 'os/services/ship/models/courier';
import { ThemeModelType } from 'os/services/theme.model';
import { ChatMessage } from './ChatMessage';

type Props = {
  messages: GraphDMType[];
  ship: ShipModelType;
  isGroup: boolean;
  height: number;
  currentTheme: ThemeModelType;
};

export const ChatLogView = ({
  messages,
  ship,
  height,
  currentTheme,
  isGroup,
}: Props) =>
  useMemo(
    () => (
      <Flex
        height={height}
        width="100%"
        position="relative"
        overflowY="auto"
        alignContent="center"
        flexDirection="column-reverse"
        paddingY={60}
      >
        <WindowedList
          width={388}
          data={messages}
          rowRenderer={(message, index, measure) => (
            <ChatMessage
              isSending={message.pending}
              // Only show author if it's a group
              // and the previous message was not from the same author
              showAuthor={
                isGroup &&
                (index === 0 || message.author !== messages[index - 1].author)
              }
              // Only show date if the previous message was sent on a different day
              showDate={
                index === 0 ||
                new Date(message.timeSent).toDateString() !==
                  new Date(messages[index - 1].timeSent).toDateString()
              }
              key={`${message.index}-${message.timeSent}-${index}`}
              theme={currentTheme}
              author={message.author}
              primaryBubble={ship.patp === message.author}
              ourColor={ship.color || '#569BE2'}
              contents={message.contents}
              timeSent={message.timeSent}
              onImageLoad={measure}
            />
          )}
          startAtBottom
        />
      </Flex>
    ),
    [isGroup, height, ship, currentTheme]
  );
