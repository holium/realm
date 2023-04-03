import { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import {
  Box,
  Flex,
  WindowedList,
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
import { ChatMessage } from '../components/ChatMessage';
import { PinnedContainer } from '../components/PinnedMessage';
import { useServices } from 'renderer/logic/store';
import { ChatMessageType, ChatModelType } from '../models';
import { useAccountStore } from 'renderer/apps/Account/store';
import { displayDate } from 'os/lib/time';

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
  const { ship, friends } = useServices();
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
  const chatAvatarEl = (
    <ChatAvatar
      sigil={sigil}
      type={type}
      path={path}
      peers={peers.map((p) => p.ship)}
      image={image}
      metadata={metadata}
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

  let subtitle;
  if (selectedChat.peers.length > 1 && selectedChat.type !== 'dm') {
    subtitle = `${selectedChat.peers.length} members`;
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
              <WindowedList
                key={`${path}-${selectedChat.lastFetch}-${messages.length}`}
                startAtBottom
                hideScrollbar
                width={containerWidth}
                height={height}
                data={messages}
                rowRenderer={(row, index, measure, _, scrollToRow) => {
                  const isLast = selectedChat
                    ? index === messages.length - 1
                    : false;

                  const isNextGrouped =
                    index < messages.length - 1 &&
                    row.sender === messages[index + 1].sender;

                  const isPrevGrouped =
                    index > 0 &&
                    row.sender === messages[index - 1].sender &&
                    Object.keys(messages[index - 1].contents[0])[0] !==
                      'status';

                  const topSpacing = isPrevGrouped ? '3px' : 2;
                  const bottomSpacing = isNextGrouped ? '3px' : 2;

                  const thisMsgDate = new Date(row.createdAt).toDateString();
                  const prevMsgDate =
                    messages[index - 1] &&
                    new Date(messages[index - 1].createdAt).toDateString();
                  const showDate: boolean =
                    index === 0 || thisMsgDate !== prevMsgDate;

                  const onClickReply = () => scrollToRow(index);

                  return (
                    <Box
                      mx="1px"
                      pt={topSpacing}
                      pb={isLast ? bottomSpacing : 0}
                    >
                      {showDate && (
                        <Text.Custom
                          opacity={0.5}
                          fontSize="12px"
                          fontWeight={500}
                          textAlign="center"
                          mt={2}
                          mb={2}
                        >
                          {displayDate(row.createdAt)}
                        </Text.Custom>
                      )}
                      <ChatMessage
                        isPrevGrouped={isPrevGrouped}
                        isNextGrouped={isNextGrouped}
                        containerWidth={containerWidth}
                        message={row as ChatMessageType}
                        ourColor={ourColor}
                        measure={measure}
                        onClickReply={onClickReply}
                      />
                    </Box>
                  );
                }}
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
