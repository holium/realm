import { useState, useMemo, useCallback } from 'react';
import {
  Flex,
  Icon,
  Button,
  TextInput,
  Box,
  Text,
  WindowedList,
} from '@holium/design-system';
// import { toJS } from 'mobx';
import { useTrayApps } from '../../store';
import { ChatRow } from '../components/ChatRow';
import { useChatStore } from '../store';
import { observer } from 'mobx-react';
import { ChatModelType } from '../models';
import { useServices } from 'renderer/logic/store';
const rowHeight = 52;

// const sortFunction = (a: ChatModelType, b: ChatModelType) => {
//   if (
//     (a.createdAt || a.metadata.timestamp) >
//     (b.createdAt || b.metadata.timestamp)
//   ) {
//     return -1;
//   }
//   if (
//     (a.createdAt || a.metadata.timestamp) <
//     (b.createdAt || b.metadata.timestamp)
//   ) {
//     return 1;
//   }
//   return 0;
// };

const scrollbarWidth = 12;
const heightPadding = 16;
const searchHeight = 42;

export const InboxPresenter = () => {
  const { ship, theme } = useServices();
  const { dimensions } = useTrayApps();
  const [showList, setShowList] = useState<boolean>(false);
  const { inbox, pinnedChatList, unpinnedChatList, setChat, setSubroute } =
    useChatStore();
  const [searchString, setSearchString] = useState<string>('');

  const searchFilter = useCallback(
    (preview: ChatModelType) => {
      if (!searchString || searchString.trim() === '') return true;
      let title: string;
      const dm = preview as ChatModelType;
      title = dm.metadata.title;
      return title.toLowerCase().indexOf(searchString.toLowerCase()) === 0;
    },
    [searchString]
  );

  const pinnedChatListFiltered = useMemo(
    () => pinnedChatList.filter(searchFilter),
    [pinnedChatList.length, searchString]
  );

  const pinnedHeight = useMemo(() => {
    let height = 0;
    pinnedChatListFiltered.forEach((chat) => {
      if (chat.type === 'space') {
        height = height + 70;
      } else {
        height = height + 56;
      }
    });
    return height;
  }, [pinnedChatListFiltered.length]);

  const listWidth = useMemo(() => dimensions.width - 26, [dimensions.width]);
  const listHeight = useMemo(
    () => dimensions.height - heightPadding - searchHeight - pinnedHeight,
    [pinnedHeight]
  );

  console.log('pinnedHeight', pinnedHeight, 'listHeight', listHeight);
  return (
    <Flex
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.01 }}
      height={dimensions.height - 24}
      width={dimensions.width - 24}
      flexDirection="column"
      onAnimationComplete={() => {
        setShowList(true);
      }}
    >
      <Flex zIndex={1} mb={2} ml={1} flexDirection="row" alignItems="center">
        <Flex width={26}>
          <Icon name="Messages" size={24} opacity={0.8} />
        </Flex>
        <Flex flex={1} pl={3} pr={2} alignItems="center">
          <TextInput
            id="dm-search"
            name="dm-search"
            width="100%"
            borderRadius={16}
            height={32}
            placeholder="Search"
            onChange={(evt: any) => {
              evt.stopPropagation();
              setSearchString(evt.target.value);
            }}
          />
        </Flex>
        <Button.IconButton
          className="realm-cursor-hover"
          size={26}
          onClick={(evt) => {
            evt.stopPropagation();
            setSubroute('new');
          }}
        >
          <Icon name="Plus" size={24} opacity={0.5} />
        </Button.IconButton>
      </Flex>
      {inbox.length === 0 ? (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={8}
        >
          <Text.Custom
            width={200}
            fontSize={3}
            fontWeight={500}
            textAlign="center"
            opacity={0.5}
          >
            No chats yet.
          </Text.Custom>
          <Text.Custom
            width={200}
            fontSize={3}
            textAlign="center"
            opacity={0.3}
          >
            Click the <b>+</b> to start.
          </Text.Custom>
        </Flex>
      ) : (
        showList && (
          <Box
            height={dimensions.height - heightPadding}
            width={dimensions.width - 26}
          >
            <Flex
              style={{
                background:
                  theme.currentTheme.mode === 'dark'
                    ? 'rgba(0,0,0,0.1)'
                    : 'rgba(0,0,0,0.035)',
              }}
              flexDirection="column"
              mb={1}
              borderRadius={6}
            >
              {pinnedChatListFiltered.filter(searchFilter).map((chat) => {
                const isAdmin = ship ? chat.isHost(ship.patp) : false;
                const height = chat.type === 'space' ? 70 : rowHeight;
                return (
                  <Box
                    key={`${window.ship}-${chat.path}-pinned`}
                    zIndex={2}
                    height={height}
                    alignItems="center"
                    layoutId={`chat-${chat.path}-container`}
                  >
                    <ChatRow
                      height={height}
                      path={chat.path}
                      title={chat.metadata.title}
                      isAdmin={isAdmin}
                      peers={chat.peers.map((peer) => peer.ship)}
                      type={chat.type}
                      timestamp={chat.createdAt || chat.metadata.timestamp}
                      metadata={chat.metadata}
                      peersGetBacklog={chat.peersGetBacklog}
                      muted={chat.muted}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setChat(chat.path);
                      }}
                    />
                  </Box>
                );
              })}
            </Flex>
            <WindowedList
              data={unpinnedChatList.filter(searchFilter)}
              followOutput="auto"
              width={listWidth + scrollbarWidth}
              height={listHeight}
              style={{ marginRight: -scrollbarWidth }}
              initialTopMostItemIndex={unpinnedChatList.length - 1}
              itemContent={(index: number, chat: ChatModelType) => {
                const isAdmin = ship ? chat.isHost(ship.patp) : false;
                const height = chat.type === 'space' ? 70 : rowHeight;

                return (
                  <Box
                    key={`${window.ship}-${chat.path}-${index}-unpinned`}
                    width={listWidth}
                    zIndex={2}
                    layout="preserve-aspect"
                    alignItems="center"
                    height={height}
                    layoutId={`chat-${chat.path}-container`}
                  >
                    <ChatRow
                      height={height}
                      path={chat.path}
                      title={chat.metadata.title}
                      peers={chat.peers.map((peer) => peer.ship)}
                      isAdmin={isAdmin}
                      type={chat.type}
                      timestamp={chat.createdAt || chat.metadata.timestamp}
                      metadata={chat.metadata}
                      peersGetBacklog={chat.peersGetBacklog}
                      muted={chat.muted}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setChat(chat.path);
                      }}
                    />
                  </Box>
                );
              }}
            />
          </Box>
        )
      )}
    </Flex>
  );
};

export const Inbox = observer(InboxPresenter);
