import { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  Avatar,
  Box,
  Bubble,
  Flex,
  Text,
  Button,
  Icon,
  WindowedList,
} from '@holium/design-system';

import { useServices } from 'renderer/logic/store';
import { useChatStore } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { useTrayApps } from 'renderer/apps/store';
import { ChatInputBox } from '../components/ChatInputBox';
import { ChatLogHeader } from '../components/ChatLogHeader';

export const DMLogPresenter = () => {
  const { dimensions } = useTrayApps();
  const { friends, ship } = useServices();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [chats, setChats] = useState<any[]>([]);
  const { selectedPath, title, type, setSubroute } = useChatStore();
  const metadata = useMemo(
    () =>
      title
        ? friends.getContactAvatarMetadata(title)
        : { patp: title!, color: '#000', nickname: '', avatar: '' },
    [title]
  );

  useEffect(() => {
    setIsFetching(true);
    if (!selectedPath) return;
    ChatDBActions.getChatLog(selectedPath)
      .then((list) => {
        setIsFetching(false);
        setChats(list);
      })
      .catch((err) => {
        setIsFetching(false);
        console.log(err);
      });
  }, [selectedPath]);

  useEffect(() => {
    ChatDBActions.onDbChange((_evt, type, data) => {
      if (type === 'message-received' && data.path === selectedPath) {
        setChats([...chats, data]);
      }
    });
  }, [selectedPath, chats]);

  if (!selectedPath) return null;

  const onSend = (fragments: any[]) => {
    ChatDBActions.sendChat(
      selectedPath,
      fragments.map((frag) => {
        return {
          content: frag,
          'reply-to': null,
          metadata: {},
        };
      })
    );
  };

  return (
    <Flex
      layout="preserve-aspect"
      layoutId={`chat-${selectedPath}-container`}
      flexDirection="column"
      // initial={{ height: 54 }}
      height={dimensions.height - 24}
      // animate={{ height: dimensions.height - 24 }}
      // exit={{ height: 54 }}
      // height={dimensions.height - 24}
    >
      <ChatLogHeader
        title={metadata.patp}
        path={selectedPath}
        onBack={() => setSubroute('inbox')}
        avatar={
          <Avatar
            patp={metadata.patp}
            avatar={metadata.avatar}
            size={28}
            sigilColor={[metadata.color, '#ffffff']}
            simple
          />
        }
      />

      <Box height={550} width="inherit">
        <WindowedList
          startAtBottom
          hideScrollbar
          height={548}
          data={chats}
          rowRenderer={(row: any, index: number) => (
            <Box
              key={`${row.id}-${index}`}
              pt={2}
              pb={index === chats.length - 1 ? 2 : 0}
            >
              <Bubble
                id={row.id}
                our={row.sender === ship?.patp}
                author={row.sender}
                authorColor={metadata.color}
                message={row.content}
                sentAt={new Date(row.timestamp).toISOString()}
                onReaction={() => {}}
              />
            </Box>
          )}
        />
      </Box>
      <ChatInputBox path={selectedPath} onSend={onSend} />
    </Flex>
  );
};

export const DMLog = observer(DMLogPresenter);
