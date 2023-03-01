import { useState, useCallback } from 'react';
import {
  Flex,
  Icon,
  Button,
  TextInput,
  WindowedList,
  Box,
  Text,
} from '@holium/design-system';
import { useTrayApps } from '../../store';
import { ChatRow } from '../components/ChatRow';
import { ChatRowType } from '../types';
import { useChatStore } from '../store';
import { observer } from 'mobx-react';

export const InboxPresenter = () => {
  const { dimensions } = useTrayApps();
  const { inbox, pinnedChatList, unpinnedChatList, setChat, setSubroute } =
    useChatStore();
  const [searchString, setSearchString] = useState<string>('');
  // const lastTimeSent = chatList[0]?.timestamp;

  const searchFilter = useCallback(
    (preview: ChatRowType) => {
      if (!searchString || searchString.trim() === '') return true;
      let sender: string;
      // if (preview.type === 'group' || preview.type === 'group-pending') {
      //   const dm = preview as ChatRowType;
      //   to = Array.from(dm.to).join(', ');
      // } else {
      //   const dm = preview as ChatRowType;
      //   to = dm.to;
      // }
      const dm = preview as ChatRowType;
      sender = dm.sender;
      return sender.indexOf(searchString) === 0;
    },
    [searchString]
  );

  return (
    <Flex height={dimensions.height - 24} flexDirection="column">
      <Flex mb={2} ml={1} flexDirection="row" alignItems="center">
        <Flex width={26}>
          <Icon name="Messages" size={24} opacity={0.8} />
        </Flex>
        <Flex flex={1} pl={3} pr={2} alignItems="center">
          <TextInput
            id="dm-search"
            name="dm-search"
            width="100%"
            borderRadius={16}
            height={34}
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
        <>
          <Flex
            style={{
              background: 'rgba(0,0,0,0.03)',
            }}
            flexDirection="column"
            mb={1}
            borderRadius={6}
          >
            {pinnedChatList.map((chat) => {
              return (
                <Box
                  key={`pinned-${chat.path}`}
                  height={52}
                  layoutId={`chat-${chat.path}-container`}
                >
                  <ChatRow
                    path={chat.path}
                    title={chat.metadata.title}
                    peers={chat.peers}
                    lastMessage={chat.lastMessage && chat.lastMessage[0]}
                    type={chat.type}
                    timestamp={
                      chat.createdAt || parseInt(chat.metadata.timestamp)
                    }
                    metadata={chat.metadata}
                    peersGetBacklog={chat.peersGetBacklog}
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
            key={`inbox-${unpinnedChatList.length}`}
            width={dimensions.width - 26}
            height={544 - pinnedChatList.length * 56}
            rowHeight={52}
            data={unpinnedChatList}
            filter={searchFilter}
            rowRenderer={(chat) => {
              return (
                <Box
                  key={`unpinned-${chat.path}`}
                  height={52}
                  layoutId={`chat-${chat.path}-container`}
                >
                  <ChatRow
                    path={chat.path}
                    title={chat.metadata.title}
                    peers={chat.peers}
                    lastMessage={chat.lastMessage && chat.lastMessage[0]}
                    type={chat.type}
                    timestamp={
                      chat.createdAt || parseInt(chat.metadata.timestamp)
                    }
                    metadata={chat.metadata}
                    peersGetBacklog={chat.peersGetBacklog}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setChat(chat.path);
                    }}
                  />
                </Box>
              );
            }}
          />
        </>
      )}
    </Flex>
  );
};

export const Inbox = observer(InboxPresenter);
