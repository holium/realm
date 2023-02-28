import { useEffect, useMemo } from 'react';
import { useServices } from 'renderer/logic/store';
import { Bubble, MenuItemProps } from '@holium/design-system';
import { useContextMenu } from 'renderer/components';
import { useChatStore } from '../store';

type ChatMessageProps = {
  message: any;
  canReact: boolean;
  authorColor: string;
  onLoad: () => void;
};

export const ChatMessage = ({
  message,
  authorColor,
  canReact,
  onLoad,
}: ChatMessageProps) => {
  const { ship } = useServices();
  const { isMessagePinned, toggleMessagePinned } = useChatStore();
  const isOur = message.sender === ship?.patp;
  const { getOptions, setOptions } = useContextMenu();

  const messageRowId = useMemo(() => `message-row-${message.id}`, [message.id]);
  // const isPinned = isMessagePinned(message.id);
  const isPinned = false;
  const contextMenuOptions = useMemo(() => {
    const menu = [];

    menu.push({
      id: `${messageRowId}-pin-message`,
      icon: isPinned ? 'Unpin' : 'Pin',
      label: isPinned ? 'Unpin' : 'Pin',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        // toggleMessagePinned(message.id, !isPinned);
      },
    });
    menu.push({
      id: `${messageRowId}-reply-to`,
      icon: 'Reply',
      label: 'Reply',
      disabled: true,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
      },
    });
    if (isOur) {
      menu.push({
        id: `${messageRowId}-edit-message`,
        icon: 'Edit',
        label: 'Edit',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
        },
      });
      menu.push({
        id: `${messageRowId}-delete-message`,
        label: 'Delete message',
        icon: 'Trash',
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
        },
      });
    }
    return menu.filter(Boolean) as MenuItemProps[];
  }, [message.id, isPinned]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(messageRowId)) {
      setOptions(messageRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, messageRowId]);

  return (
    <Bubble
      id={messageRowId}
      isOur={message.sender === ship?.patp}
      author={message.sender}
      authorColor={authorColor}
      message={message.content}
      sentAt={new Date(message.createdAt).toISOString()}
      onLoad={onLoad}
      onReaction={canReact ? () => {} : undefined}
    />
  );
};
