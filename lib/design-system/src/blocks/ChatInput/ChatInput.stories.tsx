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
    <Flex position="relative" height={670} width={400}>
      <Box height={600} width="inherit" borderRadius={12} overflow="hidden">
        <WindowedList
          startAtBottom
          data={messages}
          rowRenderer={(row: ChatMessageType, index: number) => (
            <Bubble {...row} onReaction={() => {}} />
            // <Flex
            //   height={itemHeight}
            //   padding={12}
            //   alignItems="center"
            //   justifyContent="center"
            //   color="input"
            //   bg={index % 2 === 0 ? 'accent' : 'card'}
            // >
            //   {row}
            // </Flex>
          )}
          hideScrollbar={true}
        />
      </Box>
      <Box position="absolute" bottom={12} left={0} right={0}>
        <ChatInput
          id="chat-send"
          onSend={(message: FragmentType[]) => {
            console.log(message);
            setMessages([
              {
                our: true,
                author: '~lomder-librun',
                sentAt: new Date().toISOString(),
                message: message,
              },
            ]);
          }}
        />
      </Box>
    </Flex>
  );
};
