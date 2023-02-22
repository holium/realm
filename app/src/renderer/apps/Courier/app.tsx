import { LayoutGroup } from 'framer-motion';
import { observer } from 'mobx-react';
import { Inbox } from './Inbox';
import { NewChat } from './NewChat';
import { ChatProvider, chatStore } from './store';
import { ChatInfo } from './views/ChatInfo';
import { DMLog } from './views/DMLog';
import { useStorage } from 'renderer/logic/lib/useStorage';
import { useEffect } from 'react';

export const CourierAppPresenter = () => {
  const storage = useStorage();
  useEffect(() => {
    chatStore.init();
  }, []);

  return (
    <ChatProvider value={chatStore}>
      <LayoutGroup>
        {chatStore.subroute === 'inbox' && <Inbox />}
        {chatStore.subroute === 'chat' && <DMLog storage={storage} />}
        {chatStore.subroute === 'chat-info' && <ChatInfo storage={storage} />}
        {chatStore.subroute === 'new' && <NewChat />}
      </LayoutGroup>
    </ChatProvider>
  );
};

export const CourierApp = observer(CourierAppPresenter);
