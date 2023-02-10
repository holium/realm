import { Row, Avatar, Flex, Text, chatDate } from '@holium/design-system';

type ChatRowProps = {
  patp: string;
  avatar?: string;
  sigilColor: string;
  lastMessage: string;
  timestamp: string;
};

export const ChatRow = ({
  patp,
  avatar,
  sigilColor,
  lastMessage,
  timestamp,
}: ChatRowProps) => {
  return (
    <Row>
      <Flex flexDirection="row" gap={12} alignItems="center" width="100%">
        <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
          <Avatar
            patp={patp}
            avatar={avatar}
            size={28}
            sigilColor={[sigilColor, '#fff']}
            simple
          />
          <Flex alignItems="flex-start" flexDirection="column">
            <Text.Custom fontWeight={500} fontSize={3}>
              {patp}
            </Text.Custom>
            <Text.Custom fontWeight={400} fontSize={2} opacity={0.5}>
              {lastMessage ? Object.values(lastMessage)[0] : 'No messages yet'}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex alignItems="flex-end" flexDirection="column">
          <Text.Custom
            style={{ wordBreak: 'keep-all' }}
            fontWeight={400}
            fontSize={2}
            opacity={0.3}
          >
            {chatDate(new Date(timestamp))}
          </Text.Custom>
          <Flex height={14}>{/* unread count */}</Flex>
        </Flex>
      </Flex>
    </Row>
  );
};
