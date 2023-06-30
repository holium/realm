import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import { convertFragmentsToPreview } from '@holium/design-system/blocks';
import { Flex, Icon, Row, Text } from '@holium/design-system/general';
import { timelineDate } from '@holium/design-system/util';

import { ChatPathType } from 'os/services/ship/chat/chat.types';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatAvatar } from '../ChatAvatar';
import { UnreadBadge } from '../UnreadBadge';
import { ChatRowHasRoomSvg } from './ChatRowHasRoomSvg';
import { useChatRowContextMenuOptions } from './useChatRowContextMenuOptions';

type ChatRowProps = {
  path: string;
  title: string;
  peers: string[];
  isAdmin: boolean;
  metadata: any;
  timestamp: number;
  type: ChatPathType;
  peersGetBacklog: boolean;
  isStandaloneChat?: boolean;
  onClick: (evt: MouseEvent<HTMLDivElement>) => void;
};

export const ChatRowPresenter = ({
  path,
  peers,
  timestamp,
  isAdmin,
  type,
  metadata,
  isStandaloneChat,
  onClick,
}: ChatRowProps) => {
  const { loggedInAccount, shellStore } = useAppState();
  const { notifStore, chatStore, spacesStore } = useShipStore();
  const roomsStore = useRoomsStore();
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

  const hasRoom = roomsStore.getRoomByPath(path);

  const chatRowId = useMemo(() => `chat-row-${path}`, [path]);
  const isPinned = isChatPinned(path);
  const isMuted = isChatMuted(path);
  const isSpaceChat = type === 'space';
  const isSelected = chatStore.selectedChat?.path === path;

  const chat = inbox.find((c) => c.path === path);
  const lastMessageUpdated: React.ReactNode = useMemo(() => {
    if (!chat) return null;
    if (!chat.lastMessage) return 'No messages yet';
    return convertFragmentsToPreview(
      chat.lastMessage.id,
      chat.lastMessage.contents
    );
  }, [chat?.lastMessage?.id]);

  const contextMenuOptions = useChatRowContextMenuOptions({
    path,
    isAdmin,
    isPinned,
    isMuted,
    isSpaceChat,
    loggedInAccount,
    chatRowId,
    setSubroute,
    setChat,
    togglePinned,
    toggleMuted,
    readPath,
    setIsBlurred: shellStore.setIsBlurred,
    openDialogWithStringProps: shellStore.openDialogWithStringProps,
  });

  const contextMenuButtonIds = contextMenuOptions.map((item) => item?.id);

  const { title, sigil, image } = getChatHeader(path);

  const space: SpaceModelType | undefined =
    type === 'space' ? spacesStore.getSpaceByChatPath(path) : undefined;

  const onClickRow = (e: React.MouseEvent<HTMLDivElement>) => {
    if (contextMenuButtonIds.includes((e.target as HTMLDivElement).id)) return;

    onClick(e);
  };

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

  useEffect(() => {
    if (contextMenuOptions !== getOptions(chatRowId)) {
      setOptions(chatRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, chatRowId]);

  return (
    <Row
      id={chatRowId}
      style={{
        minWidth: 0,
        background:
          isStandaloneChat && isSelected
            ? 'rgba(var(--rlm-accent-rgba), 0.12)'
            : undefined,
      }}
      onClick={onClickRow}
    >
      <Flex
        pointerEvents="none"
        gap={12}
        alignItems="center"
        width="100%"
        minWidth={0}
      >
        <Flex flex={1} gap={12} alignItems="center" minWidth={0}>
          <Flex
            position="relative"
            transition={{
              duration: isStandaloneChat ? 0 : 0.15,
            }}
          >
            <ChatAvatar
              sigil={sigil}
              type={type}
              path={path}
              peers={peers}
              image={image}
              color={space?.color}
              metadata={metadata}
              canEdit={false}
            />
            {hasRoom && isStandaloneChat && (
              <Flex
                position="absolute"
                bottom={-7}
                right={-7}
                background="var(--rlm-accent-color)"
                borderRadius="50%"
                padding="2px"
                alignItems="center"
                justifyContent="center"
              >
                <ChatRowHasRoomSvg />
              </Flex>
            )}
          </Flex>
          <Flex
            flex={1}
            alignItems="flex-start"
            flexDirection="column"
            minWidth={0}
          >
            {space && (
              <Text.Custom
                textAlign="left"
                // layoutId={
                //   isStandaloneChat ? undefined : `chat-${path}-pretitle`
                // }
                // layout={isStandaloneChat ? undefined : 'preserve-aspect'}
                transition={{
                  duration: isStandaloneChat ? 0 : 0.15,
                }}
                width={210}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.5, lineHeight: '1' }}
                fontWeight={500}
                fontSize={1}
              >
                {space.name}
              </Text.Custom>
            )}
            <Flex
              flex={1}
              minWidth={0}
              width="100%"
              gap="4px"
              alignItems="center"
              position="relative"
            >
              <Flex flex={1} minWidth={0} maxWidth="100%">
                <Text.Custom
                  // layoutId={isStandaloneChat ? undefined : `chat-${path}-name`}
                  // layout={isStandaloneChat ? undefined : 'preserve-aspect'}
                  truncate
                  textAlign="left"
                  transition={{
                    duration: isStandaloneChat ? 0 : 0.15,
                  }}
                  fontWeight={500}
                  fontSize={3}
                >
                  {title}
                </Text.Custom>
              </Flex>
              <Flex gap="6px" alignItems="center">
                <Text.Custom
                  style={{ wordBreak: 'keep-all' }}
                  fontWeight={400}
                  fontSize={1}
                  opacity={0.3}
                >
                  {lastMessageTimestamp}
                </Text.Custom>
                {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
              </Flex>
            </Flex>
            <Flex
              flex={1}
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text.Custom
                textAlign="left"
                // layoutId={
                //   isStandaloneChat ? undefined : `chat-${path}-subtitle`
                // }
                // layout={isStandaloneChat ? undefined : 'preserve-aspect'}
                truncate
                width={210}
                fontWeight={400}
                transition={{
                  duration: isStandaloneChat ? 0 : 0.1,
                }}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.5, lineHeight: '1.2' }}
                exit={{ opacity: 0 }}
                fontSize={2}
              >
                {lastMessageUpdated}
              </Text.Custom>
              <Flex gap="6px" alignItems="center">
                {isMuted && (
                  <Icon
                    name="NotificationOff"
                    size={12}
                    fill="text"
                    opacity={0.3}
                  />
                )}
                {isPinned && (
                  <Icon name="Pin" size={12} fill="text" opacity={0.3} />
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Row>
  );
};

export const ChatRow = observer(ChatRowPresenter);
