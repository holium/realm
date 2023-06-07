import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { trackEvent } from 'renderer/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../../../store';
import { InboxView } from './InboxView';

type Props = {
  isStandaloneChat?: boolean;
};

export const InboxPresenter = ({ isStandaloneChat = false }: Props) => {
  const { loggedInAccount, shellStore } = useAppState();
  const { chatStore, spacesStore } = useShipStore();
  const { dimensions } = useTrayApps();
  const { sortedChatList, setChat, setSubroute, isChatPinned } = chatStore;
  const currentSpace = spacesStore.selected;

  useEffect(() => {
    trackEvent('OPENED', 'CHAT_INBOX');
  }, []);

  return (
    <InboxView
      inboxes={sortedChatList}
      width={isStandaloneChat ? undefined : dimensions.width - 24}
      height={isStandaloneChat ? undefined : dimensions.height - 24}
      accountIdentity={loggedInAccount?.serverId}
      spacePath={currentSpace?.path}
      isStandaloneChat={isStandaloneChat}
      isChatPinned={isChatPinned}
      onClickInbox={setChat}
      onClickNewInbox={() => setSubroute('new')}
      onClickStandaloneChat={() => {
        shellStore.setStandaloneChat(!isStandaloneChat);
      }}
    />
  );
};

export const Inbox = observer(InboxPresenter);
