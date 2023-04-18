import { observer } from 'mobx-react';
import { Inbox } from './views/Inbox';
import { NewChat } from './views/NewChat';
import { ChatProvider, chatStore } from './store';
import { useEffect } from 'react';
import { ChatInfo } from './views/ChatInfo';
import { ChatLog } from './views/ChatLog';
import { useStorage } from 'renderer/logic/lib/useStorage';
import { LayoutGroup } from 'framer-motion';
import { useTrayApps } from 'renderer/apps/store';

export const CourierAppPresenter = () => {
  const { clearInnerNavigation } = useTrayApps();
  const storage = useStorage();
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
