import { FC, useMemo } from 'react';
import { darken, lighten } from 'polished';
import { Flex, Text } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Bubble } from './Bubble';
import { Message } from './Message';
import { displayDate } from 'os/lib/time';

export type MessageType = {
  index?: string;
  author: string;
  contents: any[];
  position: 'right' | 'left';
  timeSent: number;
  // type: 'text' | 'url' | 'mention' | 'code' | 'reference' | string;
};

type IProps = {
  showAuthor: boolean;
  theme: ThemeModelType;
  our: string;
  ourColor: string;
  message: MessageType;
};

export const ChatMessage: FC<IProps> = (props: IProps) => {
  const { theme, our, ourColor, message, showAuthor } = props;
  const primaryBubble = our === message.author;
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

  const messageTypes = useMemo(
    () =>
      message.contents.map((content: any) => {
        return Object.keys(content)[0];
      }),
    [message.index]
  );

  const referenceColor = useMemo(
    () =>
      theme.mode === 'light'
        ? darken(0.075, theme!.windowColor)
        : theme!.windowColor,
    [theme.windowColor]
  );

  const isMention = messageTypes.includes('mention');
  return (
    <Flex
      alignItems={primaryBubble ? 'flex-end' : 'flex-start'}
      flexDirection="column"
      mb={2}
      pl={2}
      pr={2}
    >
      {showAuthor && (
        <Flex mb="2px" mr={primaryBubble ? 1 : 0} ml={primaryBubble ? 0 : 1}>
          <Text opacity={0.5} fontSize={1}>
            {message.author}
          </Text>
        </Flex>
      )}
      <Bubble
        primary={primaryBubble}
        customBg={
          primaryBubble
            ? ourColor
            : theme.mode === 'dark'
            ? lighten(0.1, theme.windowColor)
            : darken(0.05, theme.windowColor)
        }
      >
        <Flex
          flexDirection={isMention ? 'row' : 'column'}
          gap={isMention ? 1 : 4}
          style={{
            flexFlow: isMention ? 'wrap' : 'column',
          }}
        >
          {message.contents.map(
            (content: { [type: string]: any }, index: number) => {
              const type = Object.keys(content)[0];
              if (content[type] === '') {
                return;
              }
              return (
                <Message
                  key={`${index}-message-${index}`}
                  type={type}
                  color={color}
                  textColor={theme!.textColor}
                  bgColor={referenceColor}
                  content={content}
                />
              );
            }
          )}
        </Flex>

        {/* TODO detect if time is today, yesterday or full */}
        <Text
          mt="2px"
          color={color}
          textAlign="right"
          fontSize={0}
          opacity={0.3}
        >
          {displayDate(message.timeSent)}
        </Text>
      </Bubble>
    </Flex>
  );
};
