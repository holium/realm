import { useEffect, useMemo } from 'react';
import { MenuItemProps, PinnedMessage } from '@holium/design-system';
import { useContextMenu } from 'renderer/components';
import { useChatStore } from '../store';
import { ChatMessageType } from '../store/models';

type PinnedContainerProps = {
  message: ChatMessageType;
};

export const PinnedContainer = ({ message }: PinnedContainerProps) => {
  const { selectedChat } = useChatStore();
  // are we an admin of the chat?
  const isAdmin = true; //selectedChat?.isAdmin;
  const { getOptions, setOptions } = useContextMenu();

  const pinnedRowId = useMemo(() => `pinned-${message.id}`, [message.id]);
  // const isPinned = isMessagePinned(message.id);
  const isPinned = false;
  const contextMenuOptions = useMemo(() => {
    const menu = [];

    menu.push({
      id: `${pinnedRowId}-hide-pinned`,
      icon: 'Hide',
      label: 'Hide pinned message',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        if (!selectedChat) return;
        // selectedChat.togglePinnedMessage(message.msg_id, isPinned);
      },
    });
    if (isAdmin) {
      menu.push({
        id: `${pinnedRowId}-unpin`,
        icon: 'Unpin',
        label: 'Unpin',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
          if (!selectedChat) return;
          selectedChat.setPinnedMessage(message.id);
        },
      });
    }
    return menu.filter(Boolean) as MenuItemProps[];
  }, [pinnedRowId, isPinned]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(pinnedRowId)) {
      setOptions(pinnedRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, pinnedRowId]);

  return (
    <PinnedMessage
      id={pinnedRowId}
      author={message.sender}
      authorColor={'#FFF'}
      message={message.contents}
      sentAt={new Date(message.createdAt).toISOString()}
      onClick={() => {
        console.log('clicked pinned message');
      }}
    />
  );
};
