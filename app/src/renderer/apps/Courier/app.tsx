import { useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { useStorage } from 'renderer/lib/useStorage';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatProvider } from '../../stores/chat.store';

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
      chatStore.init();
    } else {
      chatStore.selectedChat?.fetchMessages();
    }
  }, []);

  useEffect(() => {
    clearInnerNavigation();
  }, [chatStore.subroute]);

  return (
    <ChatProvider value={chatStore}>
      <LayoutGroup>
        {chatStore.subroute === 'inbox' && <Inbox />}
        {chatStore.subroute === 'chat' && <ChatLog storage={storage} />}
        {chatStore.subroute === 'chat-info' && <ChatInfo storage={storage} />}
        {chatStore.subroute === 'new' && <NewChat />}
      </LayoutGroup>
    </ChatProvider>
  );
};

export const CourierApp = observer(CourierAppPresenter);
