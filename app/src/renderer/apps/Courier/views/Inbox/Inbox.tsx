import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { trackEvent } from 'renderer/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { InboxBody } from './InboxBody';

type Props = {
  isStandaloneChat?: boolean;
};

export const InboxPresenter = ({ isStandaloneChat = false }: Props) => {
  const { loggedInAccount, shellStore } = useAppState();
  const { chatStore, spacesStore } = useShipStore();

  const { sortedChatList, loader, setChat, setSubroute, isChatPinned } =
    chatStore;
  const currentSpace = spacesStore.selected;

  useEffect(() => {
    trackEvent('OPENED', 'CHAT_INBOX');
  }, []);

  return (
    <InboxBody
      inboxes={sortedChatList}
      accountIdentity={loggedInAccount?.serverId}
      spacePath={currentSpace?.path}
      isStandaloneChat={isStandaloneChat}
      isLoading={loader.isLoading}
      isChatPinned={isChatPinned}
      onClickInbox={(path) => {
        setChat(path);
        setSubroute('chat');
      }}
      onClickNewInbox={() => {
        setChat('');
        setSubroute('new');
      }}
      onClickStandaloneChat={() => {
        shellStore.setStandaloneChat(!isStandaloneChat);
      }}
    />
  );
};

export const Inbox = observer(InboxPresenter);
