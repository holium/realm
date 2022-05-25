import { FC, useState } from 'react';
import { lighten } from 'polished';
import { Flex, Text } from '../../../../components';
import { WindowThemeType } from '../../../../logic/stores/config';
import { Bubble } from './Bubble';
import { Message } from './Message';
import { displayDate } from '../../../../logic/utils/time';

export type MessageType = {
  author: string;
  content: any;
  position: 'right' | 'left';
  timeSent: number;
  type: 'text' | 'url' | 'mention' | 'code' | 'reference' | string;
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
        <Message type={message.type} color={color} content={message.content} />
        {/* TODO detect if time is today, yesterday or full */}
        <Text mt={2} color={color} textAlign="right" fontSize={1} opacity={0.4}>
          {displayDate(message.timeSent)}
        </Text>
      </Bubble>
    </Flex>
  );
};
