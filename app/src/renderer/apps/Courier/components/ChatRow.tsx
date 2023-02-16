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
    <Row onClick={onClick}>
      <Flex flexDirection="row" gap={12} alignItems="center" width="100%">
        <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
          <Avatar
            // layoutId={`chat-${path}-avatar`}
            // layout="position"
            // transition={{
            //   duration: 0.1,
            //   spring: { damping: 0, stiffness: 10000 },
            //   layout: { duration: 0.1, ease: 'easeInOut' },
            // }}
            patp={patp}
            avatar={avatar}
            size={28}
            sigilColor={[sigilColor, '#ffffff']}
            simple

          />
          <Flex alignItems="flex-start" flexDirection="column">
            <Text.Custom
              // layoutId={`chat-${path}-name`}
              // layout="position"
              // transition={{
              //   duration: 0.1,
              //   spring: { damping: 0, stiffness: 10000 },
              //   layout: { duration: 0.1, ease: 'easeInOut' },
              // }}
              fontWeight={500}
              fontSize={3}
            >
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
            {timelineDate(new Date(timestamp))}
          </Text.Custom>
          <Flex height={14}>{/* unread count */}</Flex>
        </Flex>
      </Flex>
    </Row>
  );
};
