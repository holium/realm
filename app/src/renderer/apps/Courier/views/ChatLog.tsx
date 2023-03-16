import { useMemo, useEffect } from 'react';
// import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Box, Flex, WindowedList, Text, Reply } from '@holium/design-system';
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
import { ChatMessageType, ChatModelType } from '../models';

type ChatLogProps = {
  storage?: IuseStorage;
};

const replyHeight = 46;
const pinHeight = 46;

export const ChatLogPresenter = (_props: ChatLogProps) => {
  const { dimensions } = useTrayApps();
  const { selectedChat, getChatTitle, setSubroute } = useChatStore();
  const { ship, friends } = useServices();

  const { color: ourColor } = useMemo(() => {
    if (!ship) return { color: '#000' };
    return friends.getContactAvatarMetadata(ship.patp);
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    selectedChat.fetchMessages();
  }, [selectedChat]);

  const resolvedTitle = useMemo(() => {
    if (!selectedChat || !ship) return 'Error loading title';
    return getChatTitle(selectedChat.path, ship.patp);
  }, [selectedChat?.path, ship]);

  if (!selectedChat) return null;
  const { path, type, peers, metadata, messages } = selectedChat;

  const showPin =
    selectedChat.pinnedMessageId !== null && !selectedChat.hidePinned;
  const chatAvatarEl = (
    <ChatAvatar
      title={resolvedTitle}
      type={type}
      path={path}
      peers={peers.map((p) => p.ship)}
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
          'reply-to': selectedChat.replyingMsg
            ? {
                path: selectedChat.path,
                'msg-id': selectedChat.replyingMsg?.id,
              }
            : null,
          metadata: {},
        };
      })
    );
  };
  const onEditConfirm = (fragments: any[]) => {
    if (!selectedChat || !selectedChat.editingMsg) return;
    selectedChat.saveEditedMessage(
      selectedChat.editingMsg.id,
      fragments.map((frag) => {
        return {
          content: frag,
          'reply-to': null,
          metadata: {},
        };
      })
    );
  };

  let height = 544;

  if (showPin) {
    height = height - pinHeight;
  }
  if (selectedChat.replyingMsg) {
    height = height - replyHeight;
  }

  return (
    <Flex
      layout="preserve-aspect"
      layoutId={`chat-${path}-container`}
      flexDirection="column"
    >
      <ChatLogHeader
        title={resolvedTitle}
        path={path}
        onBack={() => setSubroute('inbox')}
        hasMenu
        avatar={chatAvatarEl}
        subtitle={
          selectedChat.peers.length > 1
            ? `${selectedChat.peers.length} members`
            : undefined
        }
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
            height={height}
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
              key={`last-${selectedChat.lastFetch}-${selectedChat.messages.length}`}
              startAtBottom
              hideScrollbar
              width={dimensions.width - 24}
              height={height}
              data={messages}
              rowRenderer={(row, index, measure) => {
                const isLast = index === messages.length - 1;
                const msgModel = selectedChat.messages.find(
                  (m) => row.id === m.id
                );
                const reactionLength = msgModel?.reactions.length || 0;
                let replyToObj: any | undefined;
                if (row.replyToMsgId) {
                  const originalMsg = selectedChat.messages.find(
                    (m) => m.id === row.replyToMsgId
                  );
                  replyToObj = originalMsg && {
                    reply: {
                      msgId: originalMsg.id,
                      author: originalMsg.sender,
                      message: [originalMsg.contents[0]],
                    },
                  };
                }
                return (
                  <Box
                    key={`${row.id}-${row.updatedAt}-${index}-last=${isLast}-${reactionLength}`}
                    pt={2}
                    pb={isLast ? 2 : 0}
                  >
                    <ChatMessage
                      replyTo={replyToObj}
                      message={row as ChatMessageType}
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
      {selectedChat.replyingMsg && (
        <Flex position="relative" flexDirection="column" zIndex={16} mb={1}>
          <ReplySection
            selectedChat={selectedChat}
            onClick={(msgId) => {
              if (!selectedChat) return;
              console.log('go to message', msgId);
              // selectedChat.replyToMessage(msgId);
            }}
            onCancel={() => selectedChat.clearReplying()}
          />
        </Flex>
      )}
      <Flex
        initial={{
          opacity: 0,
        }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.1,
        }}
        height={40}
      >
        <ChatInputBox
          onSend={onMessageSend}
          onEditConfirm={onEditConfirm}
          editMessage={selectedChat.editingMsg}
          onCancelEdit={(evt) => {
            evt.stopPropagation();
            if (!selectedChat) return;
            selectedChat.cancelEditing();
          }}
        />
      </Flex>
    </Flex>
  );
};

export const ChatLog = observer(ChatLogPresenter);

type ReplySectionProps = {
  selectedChat: ChatModelType;
  onCancel: () => void;
  onClick?: (evt: React.MouseEvent<HTMLDivElement>) => void;
};

const ReplySection = ({ selectedChat, onCancel }: ReplySectionProps) => {
  const { friends } = useServices();

  const replyTo = selectedChat.replyingMsg;
  if (!replyTo) return null;
  const { color: authorColor } = friends.getContactAvatarMetadata(
    replyTo.sender
  );
  return (
    <Flex
      height={replyHeight}
      flexDirection="column"
      justifyContent="flex-end"
      alignItems="center"
    >
      <Reply
        id={replyTo.id}
        author={replyTo.sender}
        authorColor={authorColor}
        message={replyTo.contents}
        sentAt={replyTo.updatedAt.toString()}
        onCancel={onCancel}
      />
    </Flex>
  );
};
