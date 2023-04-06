import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Box } from '../../general';
import { ChatInput } from './ChatInput';
import { Bubble } from '../Bubble/Bubble';
import { ChatMessageType, FragmentType } from '../Bubble/Bubble.types';
import { Virtuoso } from 'react-virtuoso';

export default {
  component: ChatInput,
} as ComponentMeta<typeof ChatInput>;

export const ChatSimulator: ComponentStory<typeof ChatInput> = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  return (
    <Flex position="relative" height={660} width={400}>
      <Box height={600} width="inherit" overflow="hidden">
        <Virtuoso
          style={{
            height: 600,
          }}
          data={messages}
          initialItemCount={messages.length - 1}
          itemContent={(index, row) => (
            <Box key={`index-${row.author}-${index}`} pt={2} width="100%">
              <Bubble
                id={`i-${index}`}
                isOur={row.our}
                {...row}
                onReaction={() => {}}
              />
            </Box>
          )}
        />
      </Box>
      <Box position="absolute" bottom={12} left={0} right={0}>
        <ChatInput
          id="chat-send"
          attachments={
            [
              // 'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679310718-pixelady-559.png',
            ]
          }
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

export const Attachment: ComponentStory<typeof ChatInput> = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  return (
    <Flex position="relative" overflow="visible" height={660} width={400}>
      <Box
        position="absolute"
        overflow="visible"
        bottom={12}
        left={0}
        right={0}
      >
        <ChatInput
          id="chat-send"
          attachments={[
            'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679310718-pixelady-559.png',
            'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679313918-wallet%20tease.mp4',
          ]}
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
