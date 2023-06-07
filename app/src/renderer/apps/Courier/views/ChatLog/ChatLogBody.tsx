import { RefObject, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Text, WindowedListRef } from '@holium/design-system/general';

import {
  ChatFragmentMobxType,
  ChatMessageType,
} from 'renderer/stores/models/chat.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInputBox } from '../../components/ChatInputBox';
import { ChatLogHeader } from '../../components/ChatLogHeader';
import { PinnedContainer } from '../../components/PinnedMessage';
import { ChatLogList } from '../ChatLogList';
import {
  ChatInputContainer,
  ChatLogListContainer,
  FullWidthAnimatePresence,
} from './ChatLogBody.styles';

type Props = {
  path: string;
  showPin: boolean;
  pinnedChatMessage: ChatMessageType;
  storage: any;
  isMuted: boolean;
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
  isStandaloneChat: boolean;
  onEditConfirm: (fragments: any[]) => void;
  onSend: (fragments: any[]) => Promise<void>;
};

const ChatLogBodyPresenter = ({
  path,
  showPin,
  pinnedChatMessage,
  storage,
  isMuted,
  ourColor,
  themeMode,
  listRef,
  replyTo,
  isStandaloneChat,
  onEditConfirm,
  onSend,
}: Props) => {
  const { chatStore } = useShipStore();
  const { selectedChat, setSubroute } = chatStore;

  const [showAttachments, setShowAttachments] = useState(false);

  if (!selectedChat) return null;

  const { messages } = selectedChat;

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
    <Flex
      flex={1}
      height="100%"
      layout="preserve-aspect"
      layoutId={isStandaloneChat ? undefined : `chat-${path}-container`}
      flexDirection="column"
    >
      <ChatLogHeader
        path={path}
        isMuted={isMuted}
        isStandaloneChat={isStandaloneChat}
        hasMenu
        onBack={() => setSubroute('inbox')}
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
          <ChatLogListContainer isStandaloneChat={isStandaloneChat}>
            {showPin && (
              <FullWidthAnimatePresence>
                <PinnedContainer
                  message={pinnedChatMessage}
                  onClick={() => {
                    const index = messages.findIndex(
                      (msg) => msg.id === pinnedChatMessage.id
                    );
                    listRef?.current?.scrollToIndex({
                      index,
                      align: 'start',
                      behavior: 'smooth',
                    });
                  }}
                />
              </FullWidthAnimatePresence>
            )}
            <ChatLogList
              listRef={listRef}
              messages={messages}
              topOfListPadding={topPadding}
              endOfListPadding={endPadding}
              ourColor={ourColor}
            />
          </ChatLogListContainer>
        )}
      </Flex>
      <ChatInputContainer isStandaloneChat={isStandaloneChat}>
        <ChatInputBox
          storage={storage}
          selectedChatPath={selectedChat.path}
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
          onCancelReply={selectedChat.clearReplying}
          onAttachmentChange={onAttachmentChange}
        />
      </ChatInputContainer>
    </Flex>
  );
};

export const ChatLogBody = observer(ChatLogBodyPresenter);
