import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Text } from 'renderer/components';
import { Box, Flex, Skeleton, WindowedList } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';

interface ChatLogProps {
  loading: boolean;
  isGroup: boolean;
  messages: GraphDMType[];
}

export const ChatLog = observer((props: ChatLogProps) => {
  const { loading, messages, isGroup } = props;
  const { dimensions } = useTrayApps();
  const { ship, theme } = useServices();

  if (messages.length === 0) {
    if (loading) {
      return (
        <Flex
          width="100%"
          justifyContent="end"
          flexDirection="column"
          mb="60px"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Box
              key={index}
              mb={2}
              mx={2}
              alignSelf={index % 3 === 1 ? 'end' : 'start'}
            >
              <Skeleton width={170} height={62} borderRadius={4} />
            </Box>
          ))}
        </Flex>
      );
    }

    return (
      <Flex
        width="100%"
        height={dimensions.height}
        flexDirection="column"
        justifyContent="center"
      >
        <Text textAlign="center" opacity={0.3} fontSize={3}>
          No messages
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      height={dimensions.height}
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
        sort={(a, b) => a.timeSent - b.timeSent}
        rowRenderer={(message, index, measure, sortedMessages) => (
          <ChatMessage
            isSending={message.pending}
            // Only show author if it's a group
            // and the previous message was not from the same author
            showAuthor={
              isGroup &&
              (index === 0 ||
                message.author !== sortedMessages[index - 1].author)
            }
            // Only show date if the previous message was sent on a different day
            showDate={
              index === 0 ||
              new Date(message.timeSent).toDateString() !==
                new Date(sortedMessages[index - 1].timeSent).toDateString()
            }
            key={`${message.index}-${message.timeSent}-${index}`}
            theme={theme.currentTheme}
            author={message.author}
            primaryBubble={ship!.patp === message.author}
            ourColor={ship!.color || '#569BE2'}
            contents={message.contents}
            timeSent={message.timeSent}
            onImageLoad={measure}
          />
        )}
        startAtBottom
      />
    </Flex>
  );
});
