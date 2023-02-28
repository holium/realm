import { useMemo, useEffect } from 'react';
import {
  Row,
  Flex,
  Text,
  timelineDate,
  MenuItemProps,
} from '@holium/design-system';
import { useContextMenu } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useChatStore } from '../store';
import { ChatPathType } from 'os/services/chat/chat.service';
import { ChatAvatar } from './ChatAvatar';
import { observer } from 'mobx-react';

type ChatRowProps = {
  path: string;
  title: string;
  peers: string[];
  lastMessage: string;
  metadata: any;
  timestamp: number;
  type: ChatPathType;
  peersGetBacklog: boolean;
  onClick: (evt: React.MouseEvent<HTMLDivElement>) => void;
};

export const ChatRowPresenter = ({
  path,
  title,
  peers,
  lastMessage,
  timestamp,
  type,
  metadata,
  peersGetBacklog,
  onClick,
}: ChatRowProps) => {
  const { setSubroute, setChat, isChatPinned, togglePinned } = useChatStore();
  const { getOptions, setOptions } = useContextMenu();

  const chatRowId = useMemo(() => `chat-row-${path}`, [path]);
  const isPinned = isChatPinned(path);
  const isMuted = false; // TODO

  const contextMenuOptions = useMemo(() => {
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
        setChat(path, title, type, peers, metadata, peersGetBacklog);
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
      label: 'Delete chat',
      icon: 'Trash',
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        ShellActions.setBlur(true);
        ShellActions.openDialogWithStringProps('leave-chat-dialog', {
          path,
          title,
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
  const chatAvatarEl = useMemo(
    () =>
      title &&
      type &&
      path &&
      peers && (
        <ChatAvatar
          title={title}
          type={type}
          path={path}
          peers={peers}
          image={metadata?.image}
          canEdit={false}
        />
      ),
    [title, path, type, peers, metadata.image]
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
            layout="position"
            transition={{
              duration: 0.1,
            }}
          >
            {chatAvatarEl}
          </Flex>
          <Flex alignItems="flex-start" flexDirection="column">
            <Text.Custom
              layoutId={`chat-${path}-name`}
              layout="position"
              truncate
              textAlign="left"
              width={210}
              transition={{
                duration: 0.1,
              }}
              fontWeight={500}
              fontSize={3}
            >
              {title}
            </Text.Custom>
            <Text.Custom
              textAlign="left"
              truncate
              width={210}
              fontWeight={400}
              fontSize={2}
              opacity={0.5}
            >
              {lastMessage ? Object.values(lastMessage)[0] : 'No messages yet'}
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
