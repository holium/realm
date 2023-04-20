import { observer } from 'mobx-react';
import { Inbox } from './views/Inbox';
import { NewChat } from './views/NewChat';
import { ChatProvider } from '../../stores/chat.store';
import { useEffect } from 'react';
import { ChatInfo } from './views/ChatInfo';
import { ChatLog } from './views/ChatLog';
import { useStorage } from 'renderer/lib/useStorage';
import { LayoutGroup } from 'framer-motion';
import { useShipStore } from 'renderer/stores/ship.store';

export const CourierAppPresenter = () => {
  const storage = useStorage();
  const { chatStore } = useShipStore();
  useEffect(() => {
    if (chatStore.subroute === 'inbox') {
      chatStore.init();
    } else {
      chatStore.selectedChat?.fetchMessages();
    }
  }, []);

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
