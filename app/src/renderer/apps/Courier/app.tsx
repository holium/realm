import { useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import { observer } from 'mobx-react';

import { useTrayApps } from 'renderer/apps/store';
import { useStorage } from 'renderer/lib/useStorage';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatInfo } from './views/ChatInfo';
import { ChatLog } from './views/ChatLog';
import { Inbox } from './views/Inbox';
import { NewChat } from './views/NewChat';

export const CourierAppPresenter = () => {
  const { clearInnerNavigation } = useTrayApps();
  const storage = useStorage();
  const { chatStore } = useShipStore();
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

  useEffect(() => {
    clearInnerNavigation();
  }, [chatStore.subroute]);

  return (
    <LayoutGroup>
      {chatStore.subroute === 'inbox' && <Inbox />}
      {chatStore.subroute === 'chat' && <ChatLog storage={storage} />}
      {chatStore.subroute === 'chat-info' && <ChatInfo storage={storage} />}
      {chatStore.subroute === 'new' && <NewChat />}
    </LayoutGroup>
  );
};

export const CourierApp = observer(CourierAppPresenter);
