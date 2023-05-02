import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Box, Flex } from '../../../general';
import { Bubble } from '../Bubble/Bubble';
import { ChatMessageType, FragmentType } from '../Bubble/Bubble.types';
import { ChatInput } from './ChatInput';

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
          containerWidth={400}
          id="chat-send"
          selectedChatPath="foo"
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
          onBlur={() => {}}
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
          containerWidth={400}
          selectedChatPath="foo"
          attachments={[
            'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679310718-pixelady-559.png',
            // 'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679313918-wallet%20tease.mp4',
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
          onBlur={() => {}}
        />
      </Box>
    </Flex>
  );
};

export const ReplyTo: ComponentStory<typeof ChatInput> = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  return (
    <Flex
      flexDirection="column"
      position="relative"
      overflow="visible"
      gap={12}
      height={660}
      width={400}
    >
      <ChatInput
        id="chat-send-1"
        selectedChatPath="foo"
        containerWidth={400}
        replyTo={{
          id: '1',
          author: '~lomder-librun',
          authorColor: '#FF0000',
          sentAt: '2023-01-26T11:04:38.000Z',
          message: [
            {
              plain:
                'Yo we should do XYZ in akdjhfkadjfadksjakasjdkasjdkaksdjasz',
            },
          ],
        }}
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
        onCancelReply={() => {}}
        onBlur={() => {}}
      />

      <ChatInput
        id="chat-send-2"
        selectedChatPath="foo"
        containerWidth={400}
        replyTo={{
          id: '2',
          author: '~lomder-librun',
          authorColor: '#FF0000',
          sentAt: '2023-01-26T11:04:38.000Z',
          message: [
            // {
            //   image:
            //     'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679310718-pixelady-559.png',
            // },
            {
              image:
                'https://images.unsplash.com/photo-1680442794210-18aaefe1bc11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2748&q=80',
            },
          ],
        }}
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
        onCancelReply={() => {}}
        onBlur={() => {}}
      />

      <ChatInput
        id="chat-send-2"
        selectedChatPath="foo"
        containerWidth={400}
        replyTo={{
          id: '2',
          author: '~lomder-librun',
          authorColor: '#FF0000',
          sentAt: '2023-01-26T11:04:38.000Z',
          message: [
            // {
            //   image:
            //     'https://sicnum-rocwen.s34.holium.network/~sicnum-rocwen/1679310718-pixelady-559.png',
            // },
            {
              link: 'https://images.unsplash.com/photo-1680442794210-18aaefe1bc11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2748&q=80',
            },
          ],
        }}
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
        onCancelReply={() => {}}
        onBlur={() => {}}
      />

      <Box
        position="absolute"
        overflow="visible"
        bottom={12}
        left={0}
        right={0}
      >
        <ChatInput
          id="chat-send"
          selectedChatPath="foo"
          containerWidth={400}
          replyTo={{
            id: '1',
            author: '~lomder-librun',
            authorColor: '#FF0000',
            sentAt: '2023-01-26T11:04:38.000Z',
            message: [
              { plain: 'Yo we should do XYZ in' },
              { bold: 'bold' },
              { plain: 'and' },
              { italics: 'italics' },
            ],
          }}
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
          onCancelReply={() => {}}
          onBlur={() => {}}
        />
      </Box>
    </Flex>
  );
};
