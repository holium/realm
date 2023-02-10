import { useState, useCallback, useEffect } from 'react';
import {
  Flex,
  Text,
  Icon,
  Button,
  InputBox,
  TextInput,
  Input,
  WindowedList,
  Box,
} from '@holium/design-system';
import {
  PreviewDMType,
  PreviewGroupDMType,
  DMPreviewType,
} from 'os/services/ship/models/courier';
import { useTrayApps } from '../store';
import { AppRegistry } from '../registry';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { ChatRow } from './components/ChatRow';

export const CourierRoot = () => {
  const { dmApp } = useTrayApps();
  const [searchString, setSearchString] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [chatList, setChatList] = useState<any[]>([]);

  useEffect(() => {
    setIsFetching(true);
    ChatDBActions.getChatList()
      .then((list) => {
        setIsFetching(false);
        setChatList(list);
      })
      .catch((err) => {
        setIsFetching(false);
        console.log(err);
      });
  }, []);

  const searchFilter = useCallback(
    (preview: DMPreviewType) => {
      if (!searchString || searchString.trim() === '') return true;
      let to: string;
      if (preview.type === 'group' || preview.type === 'group-pending') {
        const dm = preview as PreviewGroupDMType;
        to = Array.from(dm.to).join(', ');
      } else {
        const dm = preview as PreviewDMType;
        to = dm.to;
      }
      return to.indexOf(searchString) === 0;
    },
    [searchString]
  );

  return (
    <Flex flexDirection="column">
      <Flex mb={2} ml={1} flexDirection="row" alignItems="center">
        <Flex width={26}>
          <Icon name="Messages" size={24} opacity={0.8} />
        </Flex>
        <Flex flex={1} pl={3} pr={2} alignItems="center">
          <InputBox
            width="100%"
            borderRadius={16}
            height={34}
            inputId="dm-search"
          >
            <Input
              id="dm-search"
              name="dm-search"
              style={{
                padding: '0px 6px',
                height: 26,
              }}
              placeholder="Search"
              onChange={(evt: any) => {
                evt.stopPropagation();
                setSearchString(evt.target.value);
              }}
            />
          </InputBox>
        </Flex>
        {/* <Text.Custom
          flex={1}
          opacity={0.8}
          textAlign="center"
          fontSize={17}
          fontWeight={500}
        >
          {AppRegistry['chat'].name}
        </Text.Custom> */}
        <Button.IconButton
          className="realm-cursor-hover"
          size={26}
          onClick={(evt) => {
            evt.stopPropagation();
            dmApp.setView('new-chat');
          }}
        >
          <Icon name="Plus" size={24} opacity={0.5} />
        </Button.IconButton>
      </Flex>
      {/* <Flex py={1}>
        <InputBox
          width="100%"
          borderRadius={16}
          height={36}
          inputId="dm-search"
        >
          <Input
            id="dm-search"
            name="dm-search"
            style={{
              padding: '0px 6px',
              height: 26,
            }}
            placeholder="Search"
            onChange={(evt: any) => {
              evt.stopPropagation();
              setSearchString(evt.target.value);
            }}
          />
        </InputBox>
      </Flex> */}
      <WindowedList
        // key={lastTimeSent}
        width={364}
        height={544}
        rowHeight={57}
        data={chatList}
        filter={searchFilter}
        rowRenderer={(chat, index) => {
          console.log(chat);
          return (
            <Box display="block" key={`dm-${index}`}>
              <ChatRow
                patp={chat.sender}
                sigilColor={'#000'}
                lastMessage={chat.lastMessage}
                timestamp={chat.timestamp}

                // onClick={(evt: any) => {
                //   evt.stopPropagation();
                //   onSelectDm(dm);
                // }}
              />
            </Box>
          );
        }}
      />
    </Flex>
  );
};
