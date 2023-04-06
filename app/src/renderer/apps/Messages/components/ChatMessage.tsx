import { useMemo } from 'react';
import { darken, lighten } from 'polished';
import { Box, Flex, Text } from 'renderer/components';
import { Bubble } from './Bubble';
import { Message } from './Message';
import { displayDate, displayTimestamp } from 'os/lib/time';
import { GraphDMType } from 'os/services/ship/models/courier';

interface IProps {
  isSending?: boolean;
  showAuthor: boolean;
  showDate: boolean;
  theme: any;
  author: string;
  primaryBubble: boolean;
  ourColor: string;
  contents: GraphDMType['contents'];
  timeSent: number;
}

export const ChatMessage = ({
  theme,
  ourColor,
  contents,
  author,
  showAuthor,
  showDate,
  isSending,
  primaryBubble,
  timeSent,
}: IProps) => {
  const messageTypes = useMemo(
    () =>
      contents.map((content: any) => {
        return Object.keys(content)[0];
      }),
    [contents]
  );
  const referenceColor = useMemo(
    () =>
      theme.mode === 'light'
        ? darken(0.075, theme.windowColor)
        : theme.windowColor,
    [theme.mode, theme.windowColor]
  );

  const color = useMemo(
    () => (primaryBubble ? 'white' : undefined),
    [primaryBubble]
  );

  const isMention = useMemo(
    () => messageTypes.includes('mention'),
    [messageTypes]
  );

  const chatMessageElement = useMemo(
    () => (
      <Flex
        opacity={isSending ? 0.5 : 1}
        alignItems={primaryBubble ? 'flex-end' : 'flex-start'}
        flexDirection="column"
        pb={2}
      >
        {showDate && (
          <Box width="100%" mb={2}>
            <Text
              opacity={0.5}
              fontSize="11px"
              fontWeight={500}
              textAlign="center"
            >
              {displayDate(timeSent)}
            </Text>
          </Box>
        )}
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
              if (content[type] === '') return;
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

          <Text
            mt="2px"
            color={color}
            textAlign={primaryBubble ? 'right' : 'left'}
            fontSize={0}
            opacity={0.3}
          >
            {displayTimestamp(timeSent)}
          </Text>
        </Bubble>
      </Flex>
    ),
    [
      author,
      color,
      contents,
      isMention,
      isSending,
      ourColor,
      primaryBubble,
      referenceColor,
      showAuthor,
      showDate,
      theme.mode,
      theme.textColor,
      theme.windowColor,
      timeSent,
    ]
  );

  if (
    contents.length === 1 &&
    'text' in contents[0] &&
    contents[0].text === ''
  ) {
    return <div />;
  }

  return chatMessageElement;
};
