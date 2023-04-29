import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import {
  convertFragmentsToPreview,
  Flex,
  MenuItemProps,
  Row,
  Text,
  timelineDate,
} from '@holium/design-system';

import { ChatPathType } from 'os/services/ship/chat/chat.types';
import { useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatAvatar } from './ChatAvatar';
import { UnreadBadge } from './UnreadBadge';

type ChatRowProps = {
  path: string;
  title: string;
  peers: string[];
  isAdmin: boolean;
  muted: boolean;
  metadata: any;
  timestamp: number;
  type: ChatPathType;
  peersGetBacklog: boolean;
  height: number;
  onClick: (evt: React.MouseEvent<HTMLDivElement>) => void;
};

export const ChatRowPresenter = ({
  path,
  peers,
  timestamp,
  isAdmin,
  type,
  metadata,
  height,
  onClick,
}: ChatRowProps) => {
  const { loggedInAccount, shellStore } = useAppState();
  const { notifStore, chatStore, spacesStore } = useShipStore();
  const {
    inbox,
    getChatHeader,
    setSubroute,
    setChat,
    isChatPinned,
    isChatMuted,
    togglePinned,
    toggleMuted,
  } = chatStore;
  const { readPath, getUnreadCountByPath } = notifStore;
  const { getOptions, setOptions } = useContextMenu();

  const unreadCount = getUnreadCountByPath(path);

  const chatRowId = useMemo(() => `chat-row-${path}`, [path]);
  const isPinned = isChatPinned(path);
  const isMuted = isChatMuted(path);
  const isSpaceChat = type === 'space';

  const chat = inbox.find((c) => c.path === path);
  const lastMessageUpdated: React.ReactNode = useMemo(() => {
    if (!chat) return null;
    if (!chat.lastMessage) return 'No messages yet';
    return convertFragmentsToPreview(
      chat.lastMessage.id,
      chat.lastMessage.contents
    );
  }, [chat?.lastMessage?.id]);

  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(
    timelineDate(
      new Date(
        (chat && chat.lastMessage && chat.lastMessage.createdAt) ||
          (chat && chat.createdAt) ||
          timestamp
      )
    )
  );
  useEffect(() => {
    let timer: NodeJS.Timeout;
    function initClock() {
      clearTimeout(timer);
      const sentDate = new Date(
        (chat && chat.lastMessage && chat.lastMessage.createdAt) || timestamp
      );
      const interval: number = (60 - sentDate.getSeconds()) * 1000 + 5;
      setLastMessageTimestamp(timelineDate(sentDate));
      timer = setTimeout(initClock, interval);
    }
    initClock();
    return () => {
      clearTimeout(timer);
    };
  }, [chat?.lastMessage?.id]);

  const contextMenuOptions = useMemo(() => {
    if (!loggedInAccount) return [];
    const menu = [];
    menu.push({
      id: `${chatRowId}-pin-chat`,
      icon: isPinned ? 'Unpin' : 'Pin',
      label: isPinned ? 'Unpin' : 'Pin',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        togglePinned(path, !isPinned);
      },
    });
    menu.push({
      id: `${chatRowId}-read-chat`,
      icon: 'MessageRead',
      label: 'Mark as read',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        readPath('realm-chat', path);
      },
    });
    menu.push({
      id: `${chatRowId}-chat-info`,
      icon: 'Info',
      label: 'Info',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        setChat(path);
        setSubroute('chat-info');
      },
    });
    menu.push({
      id: `${chatRowId}-mute-chat`,
      icon: isMuted ? 'NotificationOff' : 'Notification',
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        toggleMuted(path, !isMuted);
      },
    });
    if (!isSpaceChat)
      menu.push({
        id: `${chatRowId}-leave-chat`,
        label: isAdmin ? 'Delete chat' : 'Leave chat',
        icon: isAdmin ? 'Trash' : 'Logout',
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          shellStore.setIsBlurred(true);
          shellStore.openDialogWithStringProps('leave-chat-dialog', {
            path,
            amHost: isAdmin.toString(),
            our: loggedInAccount.patp,
          });
        },
      });
    return menu.filter(Boolean) as MenuItemProps[];
  }, [path, isPinned, isMuted]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(chatRowId)) {
      setOptions(chatRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, chatRowId]);

  const contextMenuButtonIds = contextMenuOptions.map((item) => item?.id);

  const { title, sigil, image } = useMemo(() => {
    return getChatHeader(path);
  }, [path, window.ship]);

  let spaceHeader = null;
  let avatarColor: string | undefined;
  if (type === 'space') {
    const space = spacesStore.getSpaceByChatPath(path);

    if (!space) {
      spaceHeader = null;
    } else {
      spaceHeader = (
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
          fontWeight={500}
          fontSize={1}
        >
          {space.name}
        </Text.Custom>
      );
      avatarColor = space.color;
    }
  }

  const chatAvatarEl = useMemo(
    () =>
      title &&
      type &&
      path &&
      peers && (
        <ChatAvatar
          sigil={sigil}
          type={type}
          path={path}
          peers={peers}
          image={image}
          color={avatarColor}
          metadata={metadata}
          canEdit={false}
        />
      ),
    [title, path, type, peers, sigil, image]
  );

  return (
    <Row
      id={chatRowId}
      height={height}
      onClick={(evt: any) => {
        if (!contextMenuButtonIds.includes(evt.target.id)) {
          onClick(evt);
        }
      }}
    >
      <Flex
        pointerEvents="none"
        flexDirection="row"
        gap={12}
        alignItems="center"
        width="100%"
      >
        <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
          <Flex
            layoutId={`chat-${path}-avatar`}
            layout="preserve-aspect"
            transition={{
              duration: 0.15,
            }}
          >
            {chatAvatarEl}
          </Flex>
          <Flex alignItems="flex-start" flexDirection="column">
            {spaceHeader && (
              <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
                {spaceHeader}
              </Flex>
            )}
            <Text.Custom
              layoutId={`chat-${path}-name`}
              layout="preserve-aspect"
              truncate
              textAlign="left"
              width={210}
              transition={{
                duration: 0.15,
              }}
              fontWeight={500}
              fontSize={3}
            >
              {title}
            </Text.Custom>
            <Text.Custom
              textAlign="left"
              layoutId={`chat-${path}-subtitle`}
              layout="preserve-aspect"
              truncate
              width={210}
              fontWeight={400}
              transition={{
                duration: 0.1,
              }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0.5, lineHeight: '1.2' }}
              exit={{ opacity: 0 }}
              fontSize={2}
            >
              {lastMessageUpdated}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex alignItems="flex-end" gap={2} flexDirection="column">
          <Text.Custom
            style={{ wordBreak: 'keep-all' }}
            fontWeight={400}
            fontSize={1}
            opacity={0.3}
          >
            {lastMessageTimestamp}
          </Text.Custom>
          <UnreadBadge count={unreadCount} />
        </Flex>
      </Flex>
    </Row>
  );
};

export const ChatRow = observer(ChatRowPresenter);
