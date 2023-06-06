import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { trackEvent } from 'renderer/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../../../store';
import { InboxView } from './InboxView';

export const InboxPresenter = () => {
  const { loggedInAccount, shellStore } = useAppState();
  const { chatStore, spacesStore } = useShipStore();
  const { dimensions } = useTrayApps();
  const { sortedChatList, setChat, setSubroute, isChatPinned } = chatStore;
  const currentSpace = spacesStore.selected;

  const [isStandaloneChat, setStandaloneChat] = useState(
    shellStore.isStandaloneChat
  );

  useEffect(() => {
    window.electron.app.isStandaloneChat().then(setStandaloneChat);
  }, []);

  useEffect(() => {
    trackEvent('OPENED', 'CHAT_INBOX');
  }, []);

  return (
    <InboxView
      inboxes={sortedChatList}
      width={dimensions.width - 24}
      height={dimensions.height - 24}
      accountIdentity={loggedInAccount?.serverId}
      spacePath={currentSpace?.path}
      isChatPinned={isChatPinned}
      onClickInbox={setChat}
      onClickNewInbox={() => setSubroute('new')}
      onClickStandaloneChat={() =>
        shellStore.setStandaloneChat(!isStandaloneChat)
      }
    />
  );
};

export const Inbox = observer(InboxPresenter);
