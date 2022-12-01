import { ChatMessage } from './ChatMessage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Text } from 'renderer/components';
import { Flex, WindowedList } from '@holium/design-system';
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

  const isBlank = !loading && messages.length === 0;

  if (isBlank) {
    return (
      <Flex
        width="full"
        align="center"
        justify="center"
        flexCol
        className={`h-[${dimensions.height}px]`}
      >
        <Text textAlign="center" opacity={0.3} fontSize={3}>
          No messages
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      width="full"
      flexCol
      align="center"
      justify="center"
      className={`h-[${dimensions.height}px] p-[60px]`}
    >
      <WindowedList
        width={388}
        data={messages}
        sort={(a, b) => a.timeSent - b.timeSent}
        rowRenderer={(message, index, measure) => (
          <ChatMessage
            isSending={message.pending}
            showAuthor={isGroup}
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
