import { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Box, Flex, WindowedList, Text } from '@holium/design-system';

import { useServices } from 'renderer/logic/store';
import { useChatStore } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { useTrayApps } from 'renderer/apps/store';
import { ChatInputBox } from '../components/ChatInputBox';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { ChatAvatar } from '../components/ChatAvatar';
import { IuseStorage } from 'renderer/logic/lib/useStorage';
import { SoundActions } from 'renderer/logic/actions/sound';
import { ChatMessage } from '../components/ChatMessage';

type ChatLogProps = {
  storage: IuseStorage;
};
export const DMLogPresenter = ({ storage }: ChatLogProps) => {
  const { dimensions } = useTrayApps();
  const { friends, ship } = useServices();
  const [chats, setChats] = useState<any[]>([]);
  const { selectedPath, title, type, peers, metadata, setSubroute } =
    useChatStore();

  const { color: sigilColor } = useMemo(
    () => friends.getContactAvatarMetadata(ship!.patp),
    []
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

  const chatAvatarEl = useMemo(
    () =>
      title &&
      type &&
      selectedPath &&
      peers && (
        <ChatAvatar
          title={title}
          type={type}
          path={selectedPath}
          peers={peers}
          image={metadata?.image}
          canEdit={false}
        />
      ),
    [title, selectedPath, type, peers, metadata?.image]
  );

  if (!selectedPath) return null;

  const onSend = (fragments: any[]) => {
    SoundActions.playDMSend();
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
    >
      <ChatLogHeader
        title={metadata ? metadata.title : ''}
        path={selectedPath}
        onBack={() => setSubroute('inbox')}
        hasMenu
        avatar={chatAvatarEl}
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
          // TODO: add pinned messages
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
                  key={`${row.id}-${row.createdAt}-${index}`}
                  pt={2}
                  pb={index === chats.length - 1 ? 2 : 0}
                >
                  <ChatMessage
                    message={row}
                    canReact={true}
                    authorColor={sigilColor}
                    onLoad={measure}
                  />
                  {/* <Bubble
                    id={row.id}
                    isOur={row.sender === ship?.patp}
                    author={row.sender}
                    authorColor={sigilColor}
                    message={row.content}
                    sentAt={new Date(row.createdAt).toISOString()}
                    onLoad={measure}
                    onReaction={() => {}}
                  /> */}
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
