import { Row, Avatar, Flex, Text, timelineDate } from '@holium/design-system';
import React, { useMemo } from 'react';
import { useServices } from 'renderer/logic/store';

type ChatRowProps = {
  path: string;
  patp: string;
  lastMessage: string;
  timestamp: number;
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
};

export const ChatRow = ({
  path,
  patp,
  lastMessage,
  timestamp,
  onClick,
}: ChatRowProps) => {
  const { friends } = useServices();
  const { avatar, color: sigilColor } = useMemo(
    () => friends.getContactAvatarMetadata(patp),
    []
  );

  return (
    <Row
      layout="preserve-aspect"
      layoutId={`chat-${path}-container`}
      onClick={onClick}
      animate={{ height: 54 }}
    >
      <Flex flexDirection="row" gap={12} alignItems="center" width="100%">
        <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
          <Flex
            layoutId={`chat-${path}-avatar`}
            layout="position"
            transition={{
              duration: 0.1,
            }}
          >
            <Avatar
              patp={patp}
              avatar={avatar}
              size={28}
              sigilColor={[sigilColor, '#ffffff']}
              simple
            />
          </Flex>
          <Flex alignItems="flex-start" flexDirection="column">
            <Text.Custom
              layoutId={`chat-${path}-name`}
              layout="position"
              truncate
              textAlign="left"
              width={210}
              transition={{
                duration: 0.1,
              }}
              fontWeight={500}
              fontSize={3}
            >
              {patp}
            </Text.Custom>
            <Text.Custom
              textAlign="left"
              truncate
              width={210}
              fontWeight={400}
              fontSize={2}
              opacity={0.5}
            >
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
            {timelineDate(new Date(timestamp))}
          </Text.Custom>
          <Flex height={14}>{/* unread count */}</Flex>
        </Flex>
      </Flex>
    </Row>
  );
};
