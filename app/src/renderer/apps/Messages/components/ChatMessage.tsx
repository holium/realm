import { FC, useMemo } from 'react';
import { darken, lighten } from 'polished';
import { Flex, Text } from 'renderer/components';
import { Bubble } from './Bubble';
import { Message } from './Message';
import { displayDate } from 'os/lib/time';
import { GraphDMType } from 'os/services/ship/models/courier';

interface IProps {
  isSending?: boolean;
  showAuthor: boolean;
  theme: any;
  author: string;
  primaryBubble: boolean;
  ourColor: string;
  contents: GraphDMType['contents'];
  timeSent: number;
}

export const ChatMessage: FC<IProps> = ({
  theme,
  ourColor,
  contents,
  author,
  showAuthor,
  isSending,
  primaryBubble,
  timeSent,
}: IProps) => {
  const messageTypes = useMemo(
    () =>
      contents.map((content: any) => {
        return Object.keys(content)[0];
      }),
    []
  );
  const referenceColor = useMemo(
    () =>
      theme.mode === 'light'
        ? darken(0.075, theme.windowColor)
        : theme.windowColor,
    [theme.mode, theme.windowColor]
  );

  const color = primaryBubble ? 'white' : undefined;
  const isMention = messageTypes.includes('mention');

  if (
    contents.length === 1 &&
    'text' in contents[0] &&
    contents[0].text === ''
  ) {
    return <div></div>;
  }

  return (
    <Flex
      opacity={isSending ? 0.5 : 1}
      alignItems={primaryBubble ? 'flex-end' : 'flex-start'}
      flexDirection="column"
      pb={2}
      pl={2}
      pr={2}
    >
      {showAuthor && (
        <Flex mb="2px" mr={primaryBubble ? 1 : 0} ml={primaryBubble ? 0 : 1}>
          <Text opacity={0.5} fontSize={1}>
            {author}
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
          {contents.map((content: { [type: string]: any }, index: number) => {
            const type = Object.keys(content)[0];
            if (content[type] === '') {
              return;
            }
            return (
              <Message
                key={`${index}-message-${index}`}
                type={type}
                color={color}
                textColor={theme.textColor}
                bgColor={referenceColor}
                content={content}
              />
            );
          })}
        </Flex>

        {/* TODO detect if time is today, yesterday or full */}
        <Text
          mt="2px"
          color={color}
          textAlign="right"
          fontSize={0}
          opacity={0.3}
        >
          {displayDate(timeSent)}
        </Text>
      </Bubble>
    </Flex>
  );
};
