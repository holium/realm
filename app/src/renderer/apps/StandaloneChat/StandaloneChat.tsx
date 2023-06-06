import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system/general';

import { useTrayApps } from 'renderer/apps/store';
import { useStorage } from 'renderer/lib/useStorage';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInfo } from '../Courier/views/ChatInfo';
import { ChatLog } from '../Courier/views/ChatLog';
import { Inbox } from '../Courier/views/Inbox/Inbox';
import { NewChat } from '../Courier/views/NewChat';

export const StandaloneChatPresenter = () => {
  const { clearInnerNavigation } = useTrayApps();
  const storage = useStorage();
  const { chatStore } = useShipStore();

  useEffect(() => {
    window.electron.app.disableRealmCursor();
  }, []);

  useEffect(() => {
    if (chatStore.subroute === 'inbox') {
      // ChatIPC.fetchPathMetadata();

      if (chatStore.inbox.length === 0) {
        chatStore.loadChatList();
      }
    } else {
      chatStore.selectedChat?.fetchMessages();
    }
  }, []);

  useEffect(clearInnerNavigation, [chatStore.subroute]);

  if (chatStore.loader.isFirstLoad) {
    return (
      <Flex
        position="absolute"
        flexDirection="column"
        justify="center"
        align="center"
        gap={12}
        left={0}
        right={0}
        top={0}
        bottom={0}
      >
        <Spinner size={1} />
        <Text.Hint opacity={0.4}>
          Fetching initial data from {window.ship}
        </Text.Hint>
      </Flex>
    );
  }

  return (
    <Flex style={{ width: '100%', height: '100%', paddingTop: 28 }}>
      <Flex minWidth={384}>
        <Inbox isStandaloneChat />
      </Flex>
      <Flex flex={1} height="100%" position="relative">
        {chatStore.subroute === 'chat' && <ChatLog storage={storage} />}
        {chatStore.subroute === 'chat-info' && <ChatInfo storage={storage} />}
        {chatStore.subroute === 'new' && <NewChat />}
      </Flex>
    </Flex>
  );
};

export const StandaloneChat = observer(StandaloneChatPresenter);
