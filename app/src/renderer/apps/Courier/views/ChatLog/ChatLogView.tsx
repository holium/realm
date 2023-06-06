import { ReactNode, RefObject, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

import { Flex, Text, WindowedListRef } from '@holium/design-system/general';

import {
  ChatFragmentMobxType,
  ChatMessageType,
  ChatModelType,
} from 'renderer/stores/models/chat.model';

import { ChatInputBox } from '../../components/ChatInputBox';
import { ChatLogHeader } from '../../components/ChatLogHeader';
import { PinnedContainer } from '../../components/PinnedMessage';
import { ChatLogList } from '../ChatLogList';

const FullWidthAnimatePresence = styled(AnimatePresence)`
  position: absolute;
  z-index: 16;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
`;

type Props = {
  path: string;
  title: string;
  pretitle?: ReactNode;
  subtitle?: ReactNode;
  chatAvatar: ReactNode;
  messages: ChatMessageType[];
  selectedChat: ChatModelType;
  showPin: boolean;
  pinnedChatMessage: ChatMessageType;
  storage: any;
  isMuted: boolean;
  width: number | string;
  height: number | string;
  ourColor: string;
  themeMode: 'light' | 'dark';
  listRef: RefObject<WindowedListRef>;
  replyTo: {
    id: string;
    author: string;
    authorColor: string;
    sentAt: string;
    message: ChatFragmentMobxType;
  } | null;
  onBack: () => void;
  onEditConfirm: (fragments: any[]) => void;
  onSend: (fragments: any[]) => Promise<void>;
};

export const ChatLogView = ({
  path,
  title,
  pretitle,
  subtitle,
  chatAvatar,
  messages,
  selectedChat,
  showPin,
  pinnedChatMessage,
  storage,
  isMuted,
  width,
  height,
  ourColor,
  themeMode,
  listRef,
  onBack,
  replyTo,
  onEditConfirm,
  onSend,
}: Props) => {
  const [showAttachments, setShowAttachments] = useState(false);

  let topPadding;
  let endPadding;
  if (showPin) {
    topPadding = 50;
  }
  if (showAttachments) {
    endPadding = 136;
  }
  if (selectedChat.replyingMsg) {
    endPadding = 56;
  }

  const onAttachmentChange = (attachmentCount: number) => {
    if (attachmentCount > 0) {
      setShowAttachments(true);
    } else {
      setShowAttachments(false);
    }
    // Wait for transition to finish, then scroll to bottom.
    setTimeout(() => {
      listRef.current?.scrollToIndex(messages.length - 1);
    }, 250);
  };

  return (
    <Flex flex={1} height="100%" flexDirection="column">
      <Flex
        flex={1}
        height="100%"
        layout="preserve-aspect"
        layoutId={`chat-${path}-container`}
        flexDirection="column"
      >
        <ChatLogHeader
          title={title}
          path={path}
          isMuted={isMuted}
          onBack={onBack}
          hasMenu
          avatar={chatAvatar}
          pretitle={pretitle}
          subtitle={subtitle}
        />
        <Flex
          flex={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.1 }}
        >
          {messages.length === 0 ? (
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width={width}
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
                ourColor={ourColor}
              />
              {showPin && (
                <FullWidthAnimatePresence>
                  <PinnedContainer message={pinnedChatMessage} />
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
          themeMode={themeMode}
          onSend={onSend}
          onEditConfirm={onEditConfirm}
          editMessage={selectedChat.editingMsg}
          replyTo={replyTo}
          onCancelEdit={(evt) => {
            evt.stopPropagation();
            if (!selectedChat) return;
            selectedChat.cancelEditing();
          }}
          onAttachmentChange={onAttachmentChange}
        />
      </Flex>
    </Flex>
  );
};
