import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react';
import styled from 'styled-components';

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

import { ChatInputBox } from 'renderer/apps/Courier/components/ChatInputBox';
import { PinnedContainer } from 'renderer/apps/Courier/components/PinnedMessage';
import { ChatLogList } from 'renderer/apps/Courier/views/ChatLogList';
import { useTrayApps } from 'renderer/apps/store';
import { IuseStorage } from 'renderer/lib/useStorage';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  ChatMessageType,
  ChatModelType,
} from '../../../stores/models/chat.model';

const FullWidthAnimatePresence = styled(AnimatePresence)`
  position: absolute;
  z-index: 16;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
`;

type RoomChatLogProps = {
  storage: IuseStorage;
  selectedChat?: ChatModelType;
};

export const RoomChatLogPresenter = ({
  storage,
  selectedChat,
}: RoomChatLogProps) => {
  const { theme } = useAppState();
  const { dimensions, innerNavigation } = useTrayApps();
  const { loggedInAccount } = useAppState();
  const { notifStore, friends, roomsStore } = useShipStore();

  const [showAttachments, setShowAttachments] = useState(false);

  const listRef = useRef<WindowedListRef>(null);

  const { color: ourColor } = useMemo(() => {
    if (!loggedInAccount) return { color: '#000' };
    return friends.getContactAvatarMetadata(loggedInAccount.patp);
  }, []);

  useEffect(() => {
    if (!selectedChat || !loggedInAccount?.patp) return;
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
    }, 340);
  }, [selectedChat?.path, innerNavigation]);

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

  if (!selectedChat || !loggedInAccount) return null;
  const { path, messages } = selectedChat;

  const showPin =
    selectedChat.pinnedMessageId !== null && !selectedChat.hidePinned;

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
    selectedChat.sendMessage(path, measuredFrags, true, loggedInAccount.patp);
    roomsStore.sendMessage(path, measuredFrags);
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

  // const height: number = dimensions.height - 400; //104;

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

  return (
    <Flex flexDirection="column" flex={1} padding={2} alignItems="center">
      <Flex
        layout="preserve-aspect"
        layoutId={`chat-${path}-container`}
        flexDirection="column"
        height="100%"
      >
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
                height={340}
                ourColor={ourColor}
                stretch
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
        flexDirection="column"
        justifySelf="flex-end"
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

export const RoomChatLog = observer(RoomChatLogPresenter);
