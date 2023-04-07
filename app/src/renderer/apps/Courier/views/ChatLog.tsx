import { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import {
  Flex,
  Text,
  Reply,
  measureImage,
  fetchOGData,
  extractOGData,
} from '@holium/design-system';
import { useChatStore } from '../store';
import { useTrayApps } from 'renderer/apps/store';
import { ChatInputBox } from '../components/ChatInputBox';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { ChatAvatar } from '../components/ChatAvatar';
import { IuseStorage } from 'renderer/logic/lib/useStorage';
import { PinnedContainer } from '../components/PinnedMessage';
import { useServices } from 'renderer/logic/store';
import { ChatMessageType, ChatModelType } from '../models';
import { useAccountStore } from 'renderer/apps/Account/store';
import { ChatLogList } from './ChatLogList';

const FullWidthAnimatePresence = styled(AnimatePresence)`
  width: 100%;
`;

type ChatLogProps = {
  storage: IuseStorage;
};

const replyHeight = 50;
const pinHeight = 46;

export const ChatLogPresenter = ({ storage }: ChatLogProps) => {
  const { dimensions } = useTrayApps();
  const { selectedChat, getChatHeader, setSubroute } = useChatStore();
  const accountStore = useAccountStore();
  const { ship, friends, spaces } = useServices();
  const [showAttachments, setShowAttachments] = useState(false);

  const { color: ourColor } = useMemo(() => {
    if (!ship) return { color: '#000' };
    return friends.getContactAvatarMetadata(ship.patp);
  }, []);

  useEffect(() => {
    if (!selectedChat || !ship?.patp) return;
    selectedChat.fetchMessages();
    const unreadCount = accountStore.getUnreadCountByPath(selectedChat.path);
    if (unreadCount > 0) {
      accountStore.readPath('realm-chat', selectedChat.path);
    }
  }, [selectedChat?.path]);

  const { title, sigil, image } = useMemo(() => {
    if (!selectedChat || !ship?.patp) return { title: 'Error loading title' };
    return getChatHeader(selectedChat.path);
  }, [selectedChat?.path, window.ship]);

  if (!selectedChat || !ship) return null;
  const { path, type, peers, metadata, messages } = selectedChat;

  const showPin =
    selectedChat.pinnedMessageId !== null && !selectedChat.hidePinned;

  let spaceTitle = undefined;
  let avatarColor: string | undefined;
  if (type === 'space') {
    const space = spaces.getSpaceByChatPath(path);
    if (space) {
      spaceTitle = space.name;
      avatarColor = space.color;
    }
  }

  const chatAvatarEl = (
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
  );

  const containerWidth = dimensions.width - 24;

  const onMessageSend = async (fragments: any[]) => {
    if (!selectedChat) return;
    const measuredFrags = await Promise.all(
      fragments.map(async (frag) => {
        let metadata: {} | string = {};
        if (Object.keys(frag)[0] === 'image') {
          const { width, height } = await measureImage(
            frag.image,
            containerWidth
          );
          metadata = { width, height };
        }
        if (Object.keys(frag)[0] === 'link') {
          const result = await fetchOGData(frag.link);
          if (result.linkType === 'opengraph') {
            metadata = {
              linkType: 'opengraph',
              ogData: JSON.stringify(extractOGData(result.data)) as string,
            };
          } else {
            metadata = {
              linkType: 'url',
            };
          }
        }
        return {
          content: frag,
          'reply-to': selectedChat.replyingMsg
            ? {
                path: selectedChat.path,
                'msg-id': selectedChat.replyingMsg?.id,
              }
            : null,
          metadata,
        };
      })
    );
    selectedChat.sendMessage(path, measuredFrags);
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

  let height = dimensions.height - 104;

  if (showPin) {
    height = height - pinHeight;
  }
  if (selectedChat.replyingMsg) {
    height = height - replyHeight;
  }
  if (showAttachments) {
    height = height - 110;
  }

  let pretitle;
  let subtitle;
  if (selectedChat.peers.length > 1 && selectedChat.type === 'group') {
    subtitle = (
      <Text.Custom
        textAlign="left"
        layoutId={`chat-${path}-subtitle`}
        layout="preserve-aspect"
        transition={{
          duration: 0.15,
        }}
        width={210}
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
        layoutId={`chat-${path}-pretitle`}
        layout="preserve-aspect"
        transition={{
          duration: 0.15,
        }}
        width={210}
        animate={{ opacity: 0.5, lineHeight: '1' }}
        fontSize={1}
        fontWeight={500}
      >
        {spaceTitle}
      </Text.Custom>
    );
  }

  return (
    <Flex flexDirection="column">
      <Flex
        layout="preserve-aspect"
        layoutId={`chat-${path}-container`}
        flexDirection="column"
      >
        <ChatLogHeader
          title={title}
          path={path}
          isMuted={selectedChat.muted}
          onBack={() => setSubroute('inbox')}
          hasMenu
          avatar={chatAvatarEl}
          pretitle={pretitle}
          subtitle={subtitle}
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
              width={containerWidth}
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
            <Flex flexDirection="column" width="100%">
              {showPin && (
                <FullWidthAnimatePresence>
                  <PinnedContainer
                    message={selectedChat.pinnedChatMessage as ChatMessageType}
                  />
                </FullWidthAnimatePresence>
              )}
              <ChatLogList
                messages={messages}
                selectedChat={selectedChat}
                width={containerWidth}
                height={height}
                ourColor={ourColor}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        position="absolute"
        flexDirection="column"
        bottom={12}
        left={12}
        right={12}
        initial={{
          opacity: 0,
        }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.1,
        }}
      >
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
        <ChatInputBox
          storage={storage}
          onSend={onMessageSend}
          onEditConfirm={onEditConfirm}
          onAttachmentChange={(attachmentCount) => {
            if (attachmentCount > 0) {
              setShowAttachments(true);
            } else {
              setShowAttachments(false);
            }
          }}
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
