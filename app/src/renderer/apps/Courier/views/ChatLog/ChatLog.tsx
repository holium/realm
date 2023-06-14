import { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';

import {
  extractOGData,
  fetchOGData,
  measureImage,
  measureTweet,
  parseMediaType,
  WindowedListRef,
} from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { trackEvent } from 'renderer/lib/track';
import { useStorage } from 'renderer/lib/useStorage';
import { useAppState } from 'renderer/stores/app.store';
import { ChatMessageType } from 'renderer/stores/models/chat.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatLogBody } from './ChatLogBody';

type Props = {
  isStandaloneChat?: boolean;
};

export const ChatLogPresenter = ({ isStandaloneChat = false }: Props) => {
  const storage = useStorage();
  const { loggedInAccount, theme } = useAppState();
  const { dimensions, innerNavigation } = useTrayApps();
  const { notifStore, friends, chatStore } = useShipStore();
  const { selectedChat } = chatStore;
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
    if (!hasLoaded && !isFetching) {
      setIsFetching(true);
      selectedChat.fetchMessages().then(() => {
        setIsFetching(false);
        setHasLoaded(true);
      });
    }
  }, [hasLoaded, isFetching]);

  useEffect(() => {
    if (!selectedChat || !loggedInAccount?.serverId) return;

    const unreadCount = notifStore.getUnreadCountByPath(selectedChat.path);
    if (unreadCount > 0) {
      notifStore.readPath('realm-chat', selectedChat.path);
    }

    if (listRef.current && messages.length > 0) {
      let goalIndex = messages.length - 1;
      const matchingIndex = messages.findIndex((m) => m.id === innerNavigation);
      if (matchingIndex !== -1) {
        goalIndex = matchingIndex;
      }
      // console.log('scrolling to index', goalIndex);

      listRef.current.scrollToIndex({
        index: goalIndex,
        align: 'start',
        behavior: innerNavigation === '' ? 'auto' : 'smooth',
      });
    }
  }, [selectedChat?.path, listRef.current, innerNavigation]);

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
  const { path, messages } = selectedChat;

  const showPin =
    selectedChat.pinnedMessageId !== null && !selectedChat.hidePinned;

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

  return (
    <ChatLogBody
      path={path}
      storage={storage}
      isMuted={selectedChat.muted}
      showPin={showPin}
      pinnedChatMessage={selectedChat.pinnedChatMessage as ChatMessageType}
      ourColor={ourColor}
      themeMode={theme.mode as 'light' | 'dark'}
      listRef={listRef}
      replyTo={replyToFormatted}
      isStandaloneChat={isStandaloneChat}
      onEditConfirm={onEditConfirm}
      onSend={onMessageSend}
    />
  );
};

export const ChatLog = observer(ChatLogPresenter);
