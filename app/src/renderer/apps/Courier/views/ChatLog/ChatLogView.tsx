import { ReactNode, RefObject, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

import {
  Box,
  Flex,
  Text,
  WindowedListRef,
} from '@holium/design-system/general';

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
  isStandaloneChat?: boolean;
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
  ourColor,
  themeMode,
  listRef,
  replyTo,
  isStandaloneChat,
  onBack,
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

  console.log('messages.length', messages.length);

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
        avatar={chatAvatar}
        pretitle={pretitle}
        subtitle={subtitle}
        hasMenu
        isStandaloneChat={isStandaloneChat}
        onBack={onBack}
      />
      <Flex
        flex={1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.1 }}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        {messages.length === 0 ? (
          <Text.Custom
            textAlign="center"
            width={300}
            fontSize={3}
            opacity={0.5}
          >
            You haven't sent or received any messages in this chat yet.
          </Text.Custom>
        ) : (
          <Flex flex={1} flexDirection="column" width="100%" paddingLeft="12px">
            {showPin && (
              <FullWidthAnimatePresence>
                <PinnedContainer message={pinnedChatMessage} />
              </FullWidthAnimatePresence>
            )}
            <ChatLogList
              listRef={listRef}
              messages={messages}
              topOfListPadding={topPadding}
              endOfListPadding={endPadding}
              ourColor={ourColor}
            />
          </Flex>
        )}
      </Flex>
      <Box
        width="100%"
        padding="11px 12px 12px 12px"
        background="var(--rlm-base-color)"
        borderTop="1px solid var(--rlm-dock-color)"
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
      </Box>
    </Flex>
  );
};
