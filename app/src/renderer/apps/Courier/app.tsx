import { LayoutGroup } from 'framer-motion';
import { observer } from 'mobx-react';
import { Chat } from './Chat';
import { Inbox } from './Inbox';
import { ChatProvider, chatStore } from './store';


export const CourierAppPresenter = () => {

  return (
    <ChatProvider value={chatStore}>
      <LayoutGroup>
        {chatStore.subroute === 'inbox' && <Inbox />}
        {chatStore.subroute === 'chat' && <Chat />}
      </LayoutGroup>
    </ChatProvider>
  )
};

export const CourierApp = observer(CourierAppPresenter)
