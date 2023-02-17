import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { Inbox } from './Inbox';
import { NewChat } from './NewChat';
import { ChatProvider, chatStore } from './store';
import { DMLog } from './views/DMLog';

export const CourierAppPresenter = () => {
  const renderLog = () => {
    if (chatStore.type === 'dm') {
      return <DMLog />;
    }
  };

  return (
    <ChatProvider value={chatStore}>
      <AnimatePresence>
        {chatStore.subroute === 'inbox' && <Inbox />}
        {chatStore.subroute === 'chat' && renderLog()}
        {chatStore.subroute === 'new' && <NewChat />}
      </AnimatePresence>
    </ChatProvider>
  );
};

export const CourierApp = observer(CourierAppPresenter);
