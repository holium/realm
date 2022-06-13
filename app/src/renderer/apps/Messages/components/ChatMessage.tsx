import { FC, useState } from 'react';
import { lighten } from 'polished';
import { Flex, Text } from 'renderer/components';
import { WindowThemeType } from 'renderer/logic/stores/config';
import { Bubble } from './Bubble';
import { Message } from './Message';
import { displayDate } from 'renderer/logic/utils/time';

export type MessageType = {
  index?: string;
  author: string;
  contents: any[];
  position: 'right' | 'left';
  timeSent: number;
  // type: 'text' | 'url' | 'mention' | 'code' | 'reference' | string;
};

type IProps = {
  theme?: WindowThemeType;
  our: string;
  ourColor: string;
  message: MessageType;
};

export const ChatMessage: FC<IProps> = (props: IProps) => {
  const { theme, our, ourColor, message } = props;
  const primaryBubble = our === `~${message.author}`;
  const color = primaryBubble ? 'white' : undefined;

  //
  // Conditional to remove empty text blocks
  //
  if (
    message.contents.length === 1 &&
    'text' in message.contents[0] &&
    message.contents[0].text === ''
  ) {
    return <div></div>;
  }

  return (
    <Flex
      justifyContent={primaryBubble ? 'flex-end' : 'flex-start'}
      mb={2}
      pl={2}
      pr={2}
    >
      <Bubble
        primary={primaryBubble}
        customBg={primaryBubble ? ourColor : lighten(0.1, theme!.windowColor)}
      >
        <Flex flexDirection="column" gap={4}>
          {message.contents.map(
            (content: { [type: string]: any }, index: number) => {
              const type = Object.keys(content)[0];
              if (content[type] === '') {
                return;
              }
              return (
                <Message
                  // preview
                  key={`${index}-message-${index}`}
                  type={type}
                  color={color}
                  content={content}
                />
              );
            }
          )}
        </Flex>

        {/* TODO detect if time is today, yesterday or full */}
        <Text mt={2} color={color} textAlign="right" fontSize={1} opacity={0.4}>
          {displayDate(message.timeSent)}
        </Text>
      </Bubble>
    </Flex>
  );
};
