import { useMemo, useEffect } from 'react';
import { isValidPatp } from 'urbit-ob';
import {
  Row,
  Avatar,
  Flex,
  Text,
  timelineDate,
  MenuItemProps,
} from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { useContextMenu } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useChatStore } from '../store';
import { ChatPathType } from 'os/services/chat/chat.service';
import { GroupSigil } from './GroupSigil';

type ChatRowProps = {
  path: string;
  title: string;
  peers: string[];
  lastMessage: string;
  metadata: any;
  timestamp: number;
  type: ChatPathType;
  onClick: (evt: React.MouseEvent<HTMLDivElement>) => void;
};

export const ChatRow = ({
  path,
  title,
  peers,
  lastMessage,
  timestamp,
  type,
  metadata,
  onClick,
}: ChatRowProps) => {
  const { friends } = useServices();
  const { setSubroute, setChat } = useChatStore();
  const { getOptions, setOptions } = useContextMenu();

  let avatarElement = null;
  if (type === 'dm' && isValidPatp(title)) {
    const {
      patp,
      avatar,
      color: sigilColor,
    } = friends.getContactAvatarMetadata(title);
    avatarElement = (
      <Avatar
        patp={patp}
        avatar={avatar}
        size={28}
        sigilColor={[sigilColor, '#ffffff']}
        simple
      />
    );
  } else if (type === 'group') {
    avatarElement = <GroupSigil path={path} patps={peers} />;
  } else {
    // TODO space type
  }

  const chatRowId = useMemo(() => `chat-row-${path}`, [path]);

  const contextMenuOptions = useMemo(() => {
    const menu = [];
    menu.push({
      id: `${chatRowId}-pin-chat`,
      icon: 'Pin',
      label: 'Pin',
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        // TODO poke pin / unpin
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
        setChat(path, title, type, peers, metadata);
        setSubroute('chat-info');
      },
    });
    menu.push({
      id: `${chatRowId}-mute-chat`,
      icon: 'NotificationOff',
      label: 'Mute',
      disabled: false,
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
  }, [path]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(chatRowId)) {
      setOptions(chatRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, chatRowId]);

  const contextMenuButtonIds = contextMenuOptions.map((item) => item?.id);

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
            {avatarElement}
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
