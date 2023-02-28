import { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Box, Flex, WindowedList, Text } from '@holium/design-system';

import { useServices } from 'renderer/logic/store';
import { useChatStore } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { useTrayApps } from 'renderer/apps/store';
import { ChatInputBox } from '../components/ChatInputBox';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { ChatAvatar } from '../components/ChatAvatar';
import { IuseStorage } from 'renderer/logic/lib/useStorage';
import { SoundActions } from 'renderer/logic/actions/sound';
import { ChatMessage } from '../components/ChatMessage';
import { PinnedContainer } from '../components/PinnedMessage';

type ChatLogProps = {
  storage?: IuseStorage;
};
export const DMLogPresenter = (_props: ChatLogProps) => {
  const { dimensions } = useTrayApps();
  const { friends, ship } = useServices();
  const { selectedChat, setSubroute } = useChatStore();

  const { color: sigilColor } = useMemo(
    () => friends.getContactAvatarMetadata(ship!.patp),
    []
  );

  useEffect(() => {
    if (!selectedChat) return;
    selectedChat.fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    ChatDBActions.onDbChange((_evt, type, data) => {
      if (type === 'message-received' && data.path === selectedChat.path) {
        selectedChat.addMessage(data);
      }
    });
  }, [selectedChat]);

  if (!selectedChat) return null;
  const { path, type, peers, metadata, messages } = selectedChat;

  const chatAvatarEl = (
    <ChatAvatar
      title={metadata.title}
      type={type}
      path={path}
      peers={peers}
      image={metadata?.image}
      canEdit={false}
    />
  );

  const onSend = (fragments: any[]) => {
    SoundActions.playDMSend();
    ChatDBActions.sendMessage(
      path,
      fragments.map((frag) => {
        return {
          content: frag,
          'reply-to': null,
          metadata: {},
        };
      })
    );
  };

  return (
    <Flex
      layout="preserve-aspect"
      layoutId={`chat-${path}-container`}
      flexDirection="column"
    >
      <ChatLogHeader
        title={metadata ? metadata.title : ''}
        path={path}
        onBack={() => setSubroute('inbox')}
        hasMenu
        avatar={chatAvatarEl}
      />
      <Flex
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        {messages.length === 0 ? (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={dimensions.width - 24}
            height={dimensions.height - 100}
          >
            <Text.Custom
              textAlign="center"
              width={300}
              fontSize={3}
              opacity={0.5}
            >
              You haven't sent or received any messages in this chat yet.
            </Text.Custom>
          </Flex>
        ) : (
          // TODO: add pinned messages
          <Flex flexDirection="column">
            {selectedChat.pinnedChatMessage && (
              <PinnedContainer message={selectedChat.pinnedChatMessage} />
            )}
            <WindowedList
              startAtBottom
              hideScrollbar
              width={dimensions.width - 24}
              height={selectedChat.pinnedChatMessage ? 550 - 50 : 550}
              data={messages}
              rowRenderer={(row, index, measure) => {
                // TODO add context menu for delete, reply, etc
                return (
                  <Box
                    key={`${row.id}-${row.createdAt}-${index}`}
                    pt={2}
                    pb={index === messages.length - 1 ? 2 : 0}
                  >
                    <ChatMessage
                      message={row}
                      canReact={true}
                      authorColor={sigilColor}
                      onLoad={measure}
                    />
                  </Box>
                );
              }}
            />
          </Flex>
        )}
      </Flex>
      <ChatInputBox onSend={onSend} />
    </Flex>
  );
};

export const DMLog = observer(DMLogPresenter);
