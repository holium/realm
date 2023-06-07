import { useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';

import {
  extractOGData,
  fetchOGData,
  measureImage,
  measureTweet,
  parseMediaType,
  Text,
  WindowedListRef,
} from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { trackEvent } from 'renderer/lib/track';
import { useStorage } from 'renderer/lib/useStorage';
import { useAppState } from 'renderer/stores/app.store';
import { ChatMessageType } from 'renderer/stores/models/chat.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatAvatar } from '../../components/ChatAvatar';
import { ChatLogView } from './ChatLogView';

type Props = {
  isStandaloneChat?: boolean;
};

export const ChatLogPresenter = ({ isStandaloneChat = false }: Props) => {
  const storage = useStorage();
  const { loggedInAccount, theme } = useAppState();
  const { dimensions, innerNavigation } = useTrayApps();
  const { notifStore, friends, chatStore, spacesStore } = useShipStore();
  const { selectedChat, getChatHeader, setSubroute } = chatStore;

  const listRef = useRef<WindowedListRef>(null);

  const { color: ourColor } = useMemo(() => {
    if (!loggedInAccount) return { color: '#000' };
    return friends.getContactAvatarMetadata(loggedInAccount.serverId);
  }, []);

  useEffect(() => {
    trackEvent('OPENED', 'CHAT_LOG');
  }, []);

  useEffect(() => {
    if (!selectedChat || !loggedInAccount?.serverId) return;
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
    if (!selectedChat || !loggedInAccount?.serverId)
      return { title: 'Error loading title' };
    return getChatHeader(selectedChat.path);
  }, [selectedChat?.path, window.ship]);

  const replyToFormatted = useMemo(() => {
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

  const containerWidth = dimensions.width - 24;

  const onMessageSend = async (fragments: any[]) => {
    if (!selectedChat) return;
    const measuredFrags = await Promise.all(
      fragments.map(async (frag) => {
        let metadata: object | string = {};
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

  let pretitle;
  let subtitle;
  if (selectedChat.peers.length > 1 && selectedChat.type === 'group') {
    subtitle = (
      <Text.Custom
        textAlign="left"
        layoutId={isStandaloneChat ? undefined : `chat-${path}-subtitle`}
        layout="preserve-aspect"
        transition={{
          duration: isStandaloneChat ? 0 : 0.15,
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
        layoutId={isStandaloneChat ? undefined : `chat-${path}-pretitle`}
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
    <ChatLogView
      path={path}
      title={title}
      pretitle={pretitle}
      subtitle={subtitle}
      messages={messages}
      selectedChat={selectedChat}
      storage={storage}
      isMuted={selectedChat.muted}
      showPin={showPin}
      pinnedChatMessage={selectedChat.pinnedChatMessage as ChatMessageType}
      width={isStandaloneChat ? '100%' : containerWidth}
      height={isStandaloneChat ? '100%' : height}
      ourColor={ourColor}
      themeMode={theme.mode as 'light' | 'dark'}
      listRef={listRef}
      replyTo={replyToFormatted}
      chatAvatar={
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
      }
      isStandaloneChat={isStandaloneChat}
      onBack={() => setSubroute('inbox')}
      onEditConfirm={onEditConfirm}
      onSend={onMessageSend}
    />
  );
};

export const ChatLog = observer(ChatLogPresenter);
