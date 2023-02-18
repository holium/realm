import { useState, useCallback, useEffect } from 'react';
import {
  Flex,
  Icon,
  Button,
  TextInput,
  WindowedList,
  Box,
} from '@holium/design-system';
import { useTrayApps } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { ChatRow } from './components/ChatRow';
import { ChatRowType } from './types';
import { useChatStore } from './store';

export const Inbox = () => {
  const { dimensions } = useTrayApps();
  const { setChat, setSubroute } = useChatStore();
  const [searchString, setSearchString] = useState<string>('');
  const [chatList, setChatList] = useState<ChatRowType[]>([]);

  useEffect(() => {
    ChatDBActions.getChatList()
      .then((list) => {
        setChatList(list);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
      <WindowedList
        width={dimensions.width - 26}
        height={544}
        rowHeight={52}
        data={chatList}
        filter={searchFilter}
        rowRenderer={(chat, index) => {
          let title: string = 'New chat';
          let timestamp = chat.timestamp;
          if (chat.peers && chat.peers.length === 1) {
            title = chat.peers[0];
          }
          if (!chat.lastMessage) {
            timestamp = parseInt(chat.metadata.timestamp);
          }
          return (
            <Box height={52} layoutId={`chat-${chat.path}-container`}>
              <ChatRow
                key={`dm-${index}-${timestamp}`}
                path={chat.path}
                title={title}
                lastMessage={chat.lastMessage && chat.lastMessage[0]}
                timestamp={timestamp}
                onClick={(evt) => {
                  evt.stopPropagation();
                  setChat(chat.path, title, 'dm');
                }}
              />
            </Box>
          );
        }}
      />
    </Flex>
  );
};
