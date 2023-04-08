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
const heightPadding = 12;
const searchHeight = 40;

export const InboxPresenter = () => {
  const { ship, spaces, theme } = useServices();
  const { dimensions } = useTrayApps();
  const [showList, setShowList] = useState<boolean>(false);
  const { inbox, sortedChatList, setChat, setSubroute, isChatPinned } =
    useChatStore();
  const [searchString, setSearchString] = useState<string>('');

  const currentSpace = spaces.selected;

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

  const listWidth = useMemo(() => dimensions.width - 26, [dimensions.width]);
  const listHeight = useMemo(
    () => dimensions.height - heightPadding - searchHeight,
    [dimensions.height]
  );

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
          <Box height={dimensions.height - heightPadding} width={listWidth}>
            <WindowedList
              data={sortedChatList.filter(searchFilter)}
              followOutput="smooth"
              width={listWidth + scrollbarWidth}
              hideScrollbar
              height={listHeight}
              style={{ marginRight: -scrollbarWidth }}
              itemContent={(index: number, chat: ChatModelType) => {
                const isAdmin = ship ? chat.isHost(ship.patp) : false;
                const height = chat.type === 'space' ? 70 : rowHeight;
                const isLast = index === sortedChatList.length - 1;
                const isSelectedSpaceChat =
                  chat.metadata.space === currentSpace?.path;
                const isPinned = isChatPinned(chat.path);
                let customStyle = {};
                let outerStyle = {};
                if (isSelectedSpaceChat) {
                  outerStyle = {
                    paddingBottom: 8,
                    height: height + 8,
                    marginBottom: 8,
                    borderBottom: '1px solid rgba(var(--rlm-border-rgba), 0.8)',
                  };
                  customStyle = {
                    borderRadius: 6,
                    // background:
                    //   theme.currentTheme.mode === 'dark'
                    //     ? 'rgba(0,0,0,0.1)'
                    //     : 'rgba(0,0,0,0.04)',
                  };
                } else if (isPinned) {
                  outerStyle = {
                    height,
                  };
                  customStyle = {
                    borderRadius: 6,
                    height,
                    background:
                      theme.currentTheme.mode === 'dark'
                        ? 'rgba(0,0,0,0.07)'
                        : 'rgba(0,0,0,0.03)',
                  };
                } else if (isLast) {
                  outerStyle = {
                    height: height + 16,
                    paddingBottom: 16,
                  };
                } else {
                  outerStyle = {
                    height,
                  };
                }

                return (
                  <Box
                    style={outerStyle}
                    key={`${window.ship}-${chat.path}-${index}-unpinned`}
                  >
                    <Box
                      key={`${window.ship}-${chat.path}-${index}-unpinned`}
                      width={listWidth}
                      zIndex={2}
                      layout="preserve-aspect"
                      alignItems="center"
                      layoutId={`chat-${chat.path}-container`}
                      style={customStyle}
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
