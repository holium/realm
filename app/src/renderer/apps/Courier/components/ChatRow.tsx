import { useMemo, useEffect } from 'react';
import {
  Row,
  Flex,
  Text,
  timelineDate,
  MenuItemProps,
  TEXT_TYPES,
} from '@holium/design-system';
import { observer } from 'mobx-react';
import { useContextMenu } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useChatStore } from '../store';
import { ChatPathType } from 'os/services/chat/chat.service';
import { ChatAvatar } from './ChatAvatar';
import { useServices } from 'renderer/logic/store';
import { useAccountStore } from 'renderer/apps/Account/store';
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
  const { ship } = useServices();
  const {
    inbox,
    getChatHeader,
    setSubroute,
    setChat,
    isChatPinned,
    isChatMuted,
    togglePinned,
    toggleMuted,
  } = useChatStore();
  const { readPath, getUnreadCountByPath } = useAccountStore();
  const { getOptions, setOptions } = useContextMenu();

  const unreadCount = getUnreadCountByPath(path);

  const chatRowId = useMemo(() => `chat-row-${path}`, [path]);
  const isPinned = isChatPinned(path);
  const isMuted = isChatMuted(path);

  const contextMenuOptions = useMemo(() => {
    if (!ship) return [];
    const menu = [];
    menu.push({
      id: `${chatRowId}-pin-chat`,
      icon: isPinned ? 'Unpin' : 'Pin',
      label: isPinned ? 'Unpin' : 'Pin',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        togglePinned(path, !isPinned);
      },
    });
    menu.push({
      id: `${chatRowId}-read-chat`,
      icon: 'MessageRead',
      label: 'Mark as read',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        readPath('realm-chat', path);
      },
    });
    menu.push({
      id: `${chatRowId}-chat-info`,
      icon: 'Info',
      label: 'Info',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        setChat(path);
        setSubroute('chat-info');
      },
    });
    menu.push({
      id: `${chatRowId}-mute-chat`,
      icon: isMuted ? 'NotificationOff' : 'Notification',
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        toggleMuted(path, !isMuted);
      },
    });
    menu.push({
      id: `${chatRowId}-leave-chat`,
      label: isAdmin ? 'Delete chat' : 'Leave chat',
      icon: isAdmin ? 'Trash' : 'Logout',
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        ShellActions.setBlur(true);
        ShellActions.openDialogWithStringProps('leave-chat-dialog', {
          path,
          amHost: isAdmin.toString(),
          our: ship.patp,
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
          metadata={metadata}
          canEdit={false}
        />
      ),
    [title, path, type, peers, sigil, image]
  );

  const chat = inbox.find((c) => c.path === path);
  const lastMessageUpdated: React.ReactNode = useMemo(() => {
    if (!chat) return null;
    if (!chat.lastMessage) return 'No messages yet';
    return (
      <span>
        {chat.lastMessage &&
          chat.lastMessage.contents.map(
            (content: { [key: string]: string }, idx: number) => {
              if (!chat.lastMessage) return null;
              let type = Object.keys(content)[0];
              const value = content[type];
              if (TEXT_TYPES.includes(type)) {
                return (
                  <span key={`${chat.lastMessage.id}-lastMessage-${idx}`}>
                    {value}
                  </span>
                );
              } else {
                if (type === 'code') type = 'code block';
                return (
                  <span
                    style={{
                      marginLeft: 2,
                      marginRight: 2,
                      fontStyle: 'italic',
                    }}
                    key={`${chat.lastMessage.id}-lastMessage-${idx}`}
                  >
                    {type}
                  </span>
                );
              }
            }
          )}
      </span>
    );
  }, [chat?.lastMessage?.id]);

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
            {timelineDate(new Date(timestamp))}
          </Text.Custom>
          <UnreadBadge count={unreadCount} />
        </Flex>
      </Flex>
    </Row>
  );
};

export const ChatRow = observer(ChatRowPresenter);