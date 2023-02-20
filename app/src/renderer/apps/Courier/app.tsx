import { LayoutGroup } from 'framer-motion';
import { observer } from 'mobx-react';
import { Inbox } from './Inbox';
import { NewChat } from './NewChat';
import { ChatProvider, chatStore } from './store';
import { ChatInfo } from './views/ChatInfo';
import { DMLog } from './views/DMLog';

export const CourierAppPresenter = () => {
  return (
    <ChatProvider value={chatStore}>
      <LayoutGroup>
        {chatStore.subroute === 'inbox' && <Inbox />}
        {chatStore.subroute === 'chat' && <DMLog />}
        {chatStore.subroute === 'chat-info' && <ChatInfo />}
        {chatStore.subroute === 'new' && <NewChat />}
      </LayoutGroup>
    </ChatProvider>
  );
};

export const CourierApp = observer(CourierAppPresenter);
