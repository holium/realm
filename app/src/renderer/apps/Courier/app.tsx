import { observer } from 'mobx-react';
import { Inbox } from './views/Inbox';
import { NewChat } from './views/NewChat';
import { ChatProvider, chatStore } from './store';
import { ChatInfo } from './views/ChatInfo';
import { ChatLog } from './views/ChatLog';
import { useStorage } from 'renderer/logic/lib/useStorage';
import { useEffect } from 'react';

export const CourierAppPresenter = () => {
  const storage = useStorage();
  useEffect(() => {
    if (chatStore.subroute === 'inbox') {
      chatStore.init();
    } else {
      console.log('chat log', chatStore.selectedChat?.path);
      chatStore.selectedChat?.fetchMessages();
    }
  }, []);

  return (
    <ChatProvider value={chatStore}>
      {chatStore.subroute === 'inbox' && <Inbox />}
      {chatStore.subroute === 'chat' && <ChatLog storage={storage} />}
      {chatStore.subroute === 'chat-info' && <ChatInfo storage={storage} />}
      {chatStore.subroute === 'new' && <NewChat />}
    </ChatProvider>
  );
};

export const CourierApp = observer(CourierAppPresenter);
