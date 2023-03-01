import { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Box, Flex, WindowedList, Text } from '@holium/design-system';
import { useChatStore } from '../store';
import { useTrayApps } from 'renderer/apps/store';
import { ChatInputBox } from '../components/ChatInputBox';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { ChatAvatar } from '../components/ChatAvatar';
import { IuseStorage } from 'renderer/logic/lib/useStorage';
import { ChatMessage } from '../components/ChatMessage';
import { PinnedContainer } from '../components/PinnedMessage';
import { AnimatePresence } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { ChatMessageType } from '../models';

type ChatLogProps = {
  storage?: IuseStorage;
};
export const ChatLogPresenter = (_props: ChatLogProps) => {
  const { dimensions } = useTrayApps();
  const { selectedChat, setSubroute } = useChatStore();
  const { ship, friends } = useServices();

  const { color: ourColor } = useMemo(() => {
    if (!ship) return { color: '#000' };
    return friends.getContactAvatarMetadata(ship.patp);
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    selectedChat.fetchMessages();
  }, [selectedChat]);

  if (!selectedChat) return null;
  const { path, type, peers, metadata, messages } = selectedChat;

  const showPin =
    selectedChat.pinnedMessageId !== null && !selectedChat.hidePinned;

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

  const onMessageSend = (fragments: any[]) => {
    if (!selectedChat) return;
    selectedChat.sendMessage(
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
          <Flex flexDirection="column">
            {showPin && (
              <AnimatePresence>
                <PinnedContainer
                  message={selectedChat.pinnedChatMessage as ChatMessageType}
                />
              </AnimatePresence>
            )}
            <WindowedList
              startAtBottom
              hideScrollbar
              width={dimensions.width - 24}
              height={showPin ? 550 - 50 : 550}
              data={messages}
              rowRenderer={(row, index, measure) => {
                return (
                  <Box
                    key={`${row.id}-${row.createdAt}-${index}`}
                    pt={2}
                    pb={index === messages.length - 1 ? 2 : 0}
                  >
                    <ChatMessage
                      message={row}
                      canReact={true}
                      ourColor={ourColor}
                      onLoad={measure}
                    />
                  </Box>
                );
              }}
            />
          </Flex>
        )}
      </Flex>
      <ChatInputBox onSend={onMessageSend} />
    </Flex>
  );
};

export const ChatLog = observer(ChatLogPresenter);
