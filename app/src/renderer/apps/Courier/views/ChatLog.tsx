import { useEffect, useMemo, useRef, useState } from 'react';
import {
  extractOGData,
  fetchOGData,
  Flex,
  measureImage,
  measureTweet,
  parseMediaType,
  Text,
  WindowedListRef,
} from '@holium/design-system';
import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { IuseStorage } from 'renderer/lib/useStorage';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import styled from 'styled-components';

import { ChatMessageType } from '../../../stores/models/chat.model';
import { ChatAvatar } from '../components/ChatAvatar';
import { ChatInputBox } from '../components/ChatInputBox';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { PinnedContainer } from '../components/PinnedMessage';

import { ChatLogList } from './ChatLogList';

const FullWidthAnimatePresence = styled(AnimatePresence)`
  position: absolute;
  z-index: 16;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
`;

type ChatLogProps = {
  storage: IuseStorage;
};

export const ChatLogPresenter = ({ storage }: ChatLogProps) => {
  const { theme } = useAppState();
  const { dimensions, innerNavigation } = useTrayApps();
  const { ship, notifStore, friends, chatStore, spacesStore } = useShipStore();
  const { selectedChat, getChatHeader, setSubroute } = chatStore;
  const [showAttachments, setShowAttachments] = useState(false);

  const listRef = useRef<WindowedListRef>(null);

  const { color: ourColor } = useMemo(() => {
    if (!ship) return { color: '#000' };
    return friends.getContactAvatarMetadata(ship.patp);
  }, []);

  useEffect(() => {
    if (!selectedChat || !ship?.patp) return;
    selectedChat.fetchMessages();
    const unreadCount = notifStore.getUnreadCountByPath(selectedChat.path);
    if (unreadCount > 0) {
      notifStore.readPath('realm-chat', selectedChat.path);
    }

    setTimeout(() => {
      let goalIndex = messages.length - 1;
      const matchingIndex = messages.findIndex((m) => m.id === innerNavigation);
      if (matchingIndex !== -1) {
        goalIndex = matchingIndex;
      }
      listRef.current?.scrollToIndex({
        index: goalIndex,
        align: 'start',
        behavior: innerNavigation === '' ? 'auto' : 'smooth',
      });
    }, 350);
  }, [selectedChat?.path, innerNavigation]);

  const { title, sigil, image } = useMemo(() => {
    if (!selectedChat || !ship?.patp) return { title: 'Error loading title' };
    return getChatHeader(selectedChat.path);
  }, [selectedChat?.path, window.ship]);

  let replyToFormatted = useMemo(() => {
    if (selectedChat?.replyingMsg) {
      const {
        color: authorColor,
        nickname,
        patp,
      } = friends.getContactAvatarMetadata(selectedChat.replyingMsg.sender);
      return {
        id: selectedChat.replyingMsg.id,
        author: nickname || patp,
        authorColor,
        sentAt: selectedChat.replyingMsg.updatedAt.toString(),
        message: selectedChat.replyingMsg.contents,
      };
    }
    return null;
  }, [selectedChat?.replyingMsg, listRef.current]);

  if (!selectedChat || !ship) return null;
  const { path, type, peers, metadata, messages } = selectedChat;

  const showPin =
    selectedChat.pinnedMessageId !== null && !selectedChat.hidePinned;

  let spaceTitle = undefined;
  let avatarColor: string | undefined;
  if (type === 'space') {
    const space = spacesStore.getSpaceByChatPath(path);
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
          const { linkType } = parseMediaType(frag.link);
          if (linkType === 'twitter') {
            // premeasure twitter
            const { width, height } = await measureTweet(
              frag.link,
              containerWidth
            );
            metadata = { linkType: 'twitter', width, height };
          } else {
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

  const height: number = dimensions.height - 104;

  let topPadding;
  let endPadding;
  if (showPin) {
    topPadding = 50;
  }
  if (showAttachments) {
    endPadding = 136;
  }
  if (selectedChat.replyingMsg) {
    endPadding = 66;
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
          transition={{ delay: 0.1, duration: 0.1 }}
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
            <Flex position="relative" flexDirection="column" width="100%">
              <ChatLogList
                listRef={listRef}
                messages={messages}
                topOfListPadding={topPadding}
                endOfListPadding={endPadding}
                selectedChat={selectedChat}
                width={containerWidth}
                height={dimensions.height - 104}
                ourColor={ourColor}
              />
              {showPin && (
                <FullWidthAnimatePresence>
                  <PinnedContainer
                    message={selectedChat.pinnedChatMessage as ChatMessageType}
                  />
                </FullWidthAnimatePresence>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        position="absolute"
        flexDirection="column"
        mt={6}
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
        <ChatInputBox
          storage={storage}
          selectedChat={selectedChat}
          themeMode={theme.mode as 'light' | 'dark'}
          onSend={onMessageSend}
          onEditConfirm={onEditConfirm}
          editMessage={selectedChat.editingMsg}
          replyTo={replyToFormatted}
          containerWidth={containerWidth}
          onCancelEdit={(evt) => {
            evt.stopPropagation();
            if (!selectedChat) return;
            selectedChat.cancelEditing();
          }}
          onAttachmentChange={(attachmentCount) => {
            if (attachmentCount > 0) {
              setShowAttachments(true);
            } else {
              setShowAttachments(false);
            }
            // Wait for transition to finish, then scroll to bottom.
            setTimeout(() => {
              listRef.current?.scrollToIndex(messages.length - 1);
            }, 250);
          }}
        />
      </Flex>
    </Flex>
  );
};

export const ChatLog = observer(ChatLogPresenter);
