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

type ChatRowProps = {
  path: string;
  title: string;
  peers: string[];
  isAdmin: boolean;
  lastMessage: string;
  metadata: any;
  timestamp: number;
  type: ChatPathType;
  peersGetBacklog: boolean;
  onClick: (evt: React.MouseEvent<HTMLDivElement>) => void;
};

export const ChatRowPresenter = ({
  path,
  peers,
  timestamp,
  isAdmin,
  type,
  metadata,
  onClick,
}: ChatRowProps) => {
  const { ship, friends } = useServices();
  const {
    inbox,
    getChatTitle,
    setSubroute,
    setChat,
    isChatPinned,
    togglePinned,
  } = useChatStore();
  const { getOptions, setOptions } = useContextMenu();

  const chatRowId = useMemo(() => `chat-row-${path}`, [path]);
  const isPinned = isChatPinned(path);
  const isMuted = false; // TODO

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
    // menu.push({
    //   id: `${chatRowId}-read-chat`,
    //   icon: 'MessageRead',
    //   label: 'Mark as read',
    //   disabled: false,
    //   onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
    //     evt.stopPropagation();
    //     // TODO poke read
    //   },
    // });
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
      icon: 'NotificationOff',
      label: 'Mute',
      disabled: true,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        // TODO poke mute notifications
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
  const resolvedTitle = useMemo(() => {
    if (!ship) return 'Error loading title';
    let title = getChatTitle(path, ship.patp);
    if (type === 'dm') {
      const { nickname } = friends.getContactAvatarMetadata(title);
      if (nickname) title = nickname;
    }
    return title;
  }, [path, ship]);

  const chatAvatarEl = useMemo(
    () =>
      resolvedTitle &&
      type &&
      path &&
      peers && (
        <ChatAvatar
          title={resolvedTitle}
          type={type}
          path={path}
          peers={peers}
          image={metadata?.image}
          metadata={metadata}
          canEdit={false}
        />
      ),
    [resolvedTitle, path, type, peers, metadata.image, ship?.patp]
  );

  const chat = inbox.find((c) => c.path === path);
  const lastMessageUpdated: React.ReactNode = useMemo(
    () => (
      <span>
        {chat &&
          chat.lastMessage &&
          chat.lastMessage.contents.map(
            (content: { [key: string]: string }, idx: number) => {
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
    ),
    [chat?.lastMessage?.id]
  );

  return (
    <Row
      id={chatRowId}
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
              {resolvedTitle}
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
              {lastMessageUpdated ? lastMessageUpdated : 'No messages yet'}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex alignItems="flex-end" flexDirection="column">
          <Text.Custom
            style={{ wordBreak: 'keep-all' }}
            fontWeight={400}
            fontSize={2}
            opacity={0.3}
          >
            {timelineDate(new Date(timestamp))}
          </Text.Custom>
          <Flex height={14}>{/* unread count */}</Flex>
        </Flex>
      </Flex>
    </Row>
  );
};

export const ChatRow = observer(ChatRowPresenter);
