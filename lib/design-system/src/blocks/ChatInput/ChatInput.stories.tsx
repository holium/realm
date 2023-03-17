import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Box, WindowedList } from '../..';
import { ChatInput } from './ChatInput';
import { Bubble } from '../Bubble/Bubble';
import { ChatMessageType, FragmentType } from '../Bubble/Bubble.types';

export default {
  component: ChatInput,
} as ComponentMeta<typeof ChatInput>;

export const ChatSimulator: ComponentStory<typeof ChatInput> = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  return (
    <Flex position="relative" height={660} width={400}>
      <Box height={600} width="inherit" overflow="hidden">
        <WindowedList
          startAtBottom
          hideScrollbar
          height={600}
          data={messages}
          rowRenderer={(row: ChatMessageType, index, measure) => (
            <Box key={`index-${row.author}-${index}`} pt={2} width="100%">
              <Bubble
                id={`i-${index}`}
                {...row}
                onReaction={() => {}}
                onLoad={measure}
              />
            </Box>
          )}
        />
      </Box>
      <Box position="absolute" bottom={12} left={0} right={0}>
        <ChatInput
          id="chat-send"
          onSend={(message: FragmentType[]) => {
            setMessages([
              ...messages,
              {
                our: true,
                author: '~lomder-librun',
                sentAt: new Date().toISOString(),
                message: message,
              },
            ]);
          }}
          onAttachment={() => {}}
          onEditConfirm={() => {}}
        />
      </Box>
    </Flex>
  );
};
