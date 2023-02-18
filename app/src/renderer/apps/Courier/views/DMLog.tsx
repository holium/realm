import { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  Avatar,
  Box,
  Bubble,
  Flex,
  WindowedList,
  Text,
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
  const [chats, setChats] = useState<any[]>([]);
  const { selectedPath, title, setSubroute } = useChatStore();
  const metadata = useMemo(
    () =>
      title
        ? friends.getContactAvatarMetadata(title)
        : { patp: title!, color: '#000', nickname: '', avatar: '' },
    [title]
  );

  useEffect(() => {
    if (!selectedPath) return;
    ChatDBActions.getChatLog(selectedPath)
      .then((list) => {
        setChats(list);
      })
      .catch((err) => {
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
    ChatDBActions.sendMessage(
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
      // // height={dimensions.height - 24}
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
      <Flex
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        {chats.length === 0 ? (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={dimensions.width - 24}
            height={dimensions.height - 100}
          >
            <Text.Custom
              textAlign="center"
              width={300}
              fontSize={3}
              opacity={0.5}
            >
              You haven't sent or received any messages in this chat yet.
            </Text.Custom>
          </Flex>
        ) : (
          <WindowedList
            startAtBottom
            hideScrollbar
            width={dimensions.width - 24}
            height={550}
            data={chats}
            rowRenderer={(row, index, measure) => {
              // TODO add context menu for delete, reply, etc
              return (
                <Box
                  key={`${row.id}-${row.timestamp}-${index}`}
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
                    onLoad={measure}
                    onReaction={() => {}}
                  />
                </Box>
              );
            }}
          />
        )}
      </Flex>
      <ChatInputBox onSend={onSend} />
    </Flex>
  );
};

export const DMLog = observer(DMLogPresenter);
