import { useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import { observer } from 'mobx-react';

import { Flex, Spinner, Text } from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInfo } from './views/ChatInfo/ChatInfo';
import { ChatLog } from './views/ChatLog/ChatLog';
import { CreateNewChat } from './views/CreateNewChat/CreateNewChat';
import { Inbox } from './views/Inbox/Inbox';

export const CourierAppPresenter = () => {
  const { clearInnerNavigation } = useTrayApps();
  const { chatStore } = useShipStore();

  useEffect(() => {
    if (chatStore.subroute === 'inbox') {
      // ChatIPC.fetchPathMetadata();

      if (chatStore.inbox.length === 0) {
        chatStore.loadChatList();
      }
    }
    // else {
    //   chatStore.selectedChat?.fetchMessages();
    // }
  }, []);

  useEffect(() => {
    clearInnerNavigation();
  }, [chatStore.subroute]);

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
    <LayoutGroup>
      {chatStore.subroute === 'inbox' && <Inbox />}
      {chatStore.subroute === 'chat' && <ChatLog />}
      {chatStore.subroute === 'chat-info' && <ChatInfo />}
      {chatStore.subroute === 'new' && <CreateNewChat />}
    </LayoutGroup>
  );
};

export const CourierApp = observer(CourierAppPresenter);
