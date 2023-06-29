import { RefObject } from 'react';
import { observer } from 'mobx-react';

import { Flex, Spinner, WindowedListRef } from '@holium/design-system/general';

import {
  ChatFragmentMobxType,
  ChatMessageType,
} from 'renderer/stores/models/chat.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInputBox } from '../../components/ChatInputBox';
import { ChatLogHeader } from '../../components/ChatLogHeader';
import { ChatInputContainer } from './ChatLogBody.styles';
import { ChatLogBodyList } from './ChatLogBodyList';

type Props = {
  path: string;
  showPin: boolean;
  pinnedChatMessage: ChatMessageType | null | undefined;
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
  const { selectedChat, setSubroute, chatLoader } = chatStore;

  const messages = selectedChat?.messages ?? [];

  let topPadding = 0;
  if (showPin) {
    topPadding = 50;
  }

  const onAttachmentChange = () => {
    // Wait for transition to finish, then scroll to bottom.
    setTimeout(() => {
      listRef.current?.scrollToIndex(messages.length - 1);
    }, 250);
  };

  return (
    <Flex flex={1} height="100%" width="100%" flexDirection="column">
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
        transition={{ duration: 0.05 }}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <ChatLogBodyList
          messages={messages}
          listRef={listRef}
          topPadding={topPadding}
          ourColor={ourColor}
          showPin={showPin}
          pinnedChatMessage={pinnedChatMessage}
          isStandaloneChat={isStandaloneChat}
          isEmpty={messages.length === 0}
          isLoaded={chatLoader.isLoaded}
        />
        {chatLoader.isLoading && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
            }}
          >
            <Spinner size="16px" width={1.5} color="var(--rlm-text-color)" />
          </div>
        )}
      </Flex>
      <ChatInputContainer isStandaloneChat={isStandaloneChat}>
        {selectedChat && (
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
        )}
      </ChatInputContainer>
    </Flex>
  );
};

export const ChatLogBody = observer(ChatLogBodyPresenter);
