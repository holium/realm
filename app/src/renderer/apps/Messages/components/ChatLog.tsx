import { GraphDMType } from 'os/services/ship/models/courier';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { Text } from 'renderer/components';
import { Box, Flex, Skeleton } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { ChatLogView } from './ChatLogView';

interface ChatLogProps {
  loading: boolean;
  isGroup: boolean;
  messages: GraphDMType[];
}

const ChatLogPresenter = (props: ChatLogProps) => {
  const { loading, messages, isGroup } = props;
  const { dimensions } = useTrayApps();
  const { ship, theme } = useServices();

  const lastMessage = messages[messages.length - 1];

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
    <ChatLogView
      key={`${lastMessage?.index}-${lastMessage?.pending}`}
      messages={messages}
      isGroup={isGroup}
      ship={ship!}
      height={dimensions.height}
      currentTheme={theme.currentTheme as any}
    />
  );
};

export const ChatLog = observer(ChatLogPresenter);
