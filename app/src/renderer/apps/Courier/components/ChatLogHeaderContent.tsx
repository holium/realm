import { useMemo } from 'react';
import { observer } from 'mobx-react';

import { Flex, Text } from '@holium/design-system/general';

import { useShipStore } from 'renderer/stores/ship.store';

import { ChatAvatar } from './ChatAvatar';

type Props = {
  isStandaloneChat?: boolean;
};

const ChatLogHeaderContentPresenter = ({ isStandaloneChat = false }: Props) => {
  const { chatStore, spacesStore } = useShipStore();
  const { selectedChat, getChatHeader } = chatStore;

  const { title, sigil, image } = useMemo(() => {
    if (!selectedChat) return { title: 'Error loading title' };

    return getChatHeader(selectedChat.path);
  }, [selectedChat?.path, window.ship]);

  if (!selectedChat) return null;

  const { path, type, peers, metadata } = selectedChat;

  let spaceTitle = undefined;
  let avatarColor: string | undefined;
  if (type === 'space') {
    const space = spacesStore.getSpaceByChatPath(path);
    if (space) {
      spaceTitle = space.name;
      avatarColor = space.color;
    }
  }

  let pretitle;
  let subtitle;
  if (selectedChat.peers.length > 1 && selectedChat.type === 'group') {
    subtitle = (
      <Text.Custom
        textAlign="left"
        layoutId={isStandaloneChat ? undefined : `chat-${path}-subtitle`}
        layout="preserve-aspect"
        transition={{
          duration: isStandaloneChat ? 0 : 0.15,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5, lineHeight: '1' }}
        fontSize={2}
      >
        {selectedChat.peers.length} members
      </Text.Custom>
    );
  }
  if (selectedChat.type === 'space') {
    pretitle = (
      <Text.Custom
        textAlign="left"
        layoutId={isStandaloneChat ? undefined : `chat-${path}-pretitle`}
        layout="preserve-aspect"
        transition={{
          duration: 0.15,
        }}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.5, lineHeight: '1' }}
        fontSize={1}
        fontWeight={500}
      >
        {spaceTitle}
      </Text.Custom>
    );
  }

  return (
    <Flex
      flexDirection="row"
      gap={12}
      alignItems="center"
      flex={1}
      style={{ maxWidth: '100%', minWidth: 0 }}
    >
      <Flex
        layoutId={isStandaloneChat ? undefined : `chat-${path}-avatar`}
        layout="preserve-aspect"
        transition={{
          duration: isStandaloneChat ? 0 : 0.15,
        }}
      >
        <ChatAvatar
          sigil={sigil}
          type={type}
          path={path}
          peers={peers.map((p) => p.ship)}
          image={image}
          metadata={metadata}
          color={avatarColor}
          canEdit={false}
        />
      </Flex>
      <Flex
        alignItems="flex-start"
        flexDirection="column"
        style={{ maxWidth: '100%', minWidth: 0 }}
      >
        {pretitle}
        <Text.Custom
          truncate
          layoutId={isStandaloneChat ? `chat-${path}-name` : undefined}
          layout="preserve-aspect"
          textAlign="left"
          transition={{
            duration: isStandaloneChat ? 0 : 0.15,
          }}
          fontWeight={500}
          fontSize={3}
          style={{ maxWidth: '100%' }}
        >
          {title}
        </Text.Custom>
        {subtitle}
      </Flex>
    </Flex>
  );
};

export const ChatLogHeaderContent = observer(ChatLogHeaderContentPresenter);
