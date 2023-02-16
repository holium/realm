import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Avatar, Box, Bubble, ChatInput, Flex, Text, Button, Icon, WindowedList } from '@holium/design-system';

import { useServices } from 'renderer/logic/store';
import { useChatStore } from './store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';

export const ChatPresenter = () => {
  const { friends } = useServices();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [chats, setChats] = useState<any[]>([]);
  const { selectedPath, title, type, setSubroute } = useChatStore();

  useEffect(() => {
    setIsFetching(true);
    if (!selectedPath) return;
    console.log(selectedPath)
    ChatDBActions.getChatLog(selectedPath)
      .then((list) => {
        setIsFetching(false);
        console.log(list)
        setChats(list);
      })
      .catch((err) => {
        setIsFetching(false);
        console.log(err);
      });
  }, [selectedPath]);


  let avatarElement = null;
  if (type === 'dm') {
    if (title) {
      const { avatar, color: sigilColor } = friends.getContactAvatarMetadata(title);
      avatarElement = (<Avatar
        // layoutId={`chat-${selectedPath}-avatar`}
        // layout="position"
        // transition={{
        //   duration: 0.1,
        //   spring: { damping: 0, stiffness: 10000 },
        //   layout: { duration: 0.1, ease: 'easeInOut', },
        // }}
        patp={title}
        avatar={avatar}
        size={28}
        sigilColor={[sigilColor, '#ffffff']}
        simple

      />);
    }
  } else {
    avatarElement = (<div>BOX</div>);
  }

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
        <Button.IconButton size={26} onClick={(evt) => {
          evt.stopPropagation();
          setSubroute('inbox');
        }}>
          <Icon name="ArrowLeftLine" size={22} opacity={.5} />
        </Button.IconButton>
        {avatarElement}
        <Flex alignItems="flex-start" flexDirection="column">
          <Text.Custom
            // layout="position"
            // transition={{
            //   duration: 0.1,
            //   spring: { damping: 0, stiffness: 10000 },
            //   layout: { duration: 0.1, ease: 'easeInOut' },
            // }}
            // layoutId={`chat-${selectedPath}-name`}
            fontWeight={500}
            fontSize={3}
          >
            {title}
          </Text.Custom>
        </Flex>
      </Flex>
      <Box height={560} width="inherit" >
        <WindowedList
          startAtBottom
          hideScrollbar
          height={550}
          data={chats}
          rowRenderer={(row: any, index: number) => (
            <Box
              key={row.id}
              style={{ pointerEvents: 'none' }}
              pt={2}
              pb={index === chats.length - 1 ? 2 : 0}
              width="calc(100% - 4px)"
            >
              <Bubble id={row.id} author={row.sender} message={row.content} sentAt={new Date(row.timestamp).toISOString()} onReaction={() => { }} />
            </Box>
          )}
        />
      </Box>
      <Box position="absolute" bottom={12} left={12} right={12}>
        <ChatInput
          id="chat-send"
          onSend={(message: any[]) => {
            // setChats([
            //   ...chats,
            //   {
            //     our: true,
            //     author: '~lomder-librun',
            //     sentAt: new Date().toISOString(),
            //     message: message,
            //   },
            // ])
          }}
          onAttachment={() => { }}
        />
      </Box>
    </Flex>
  );
};

export const Chat = observer(ChatPresenter)