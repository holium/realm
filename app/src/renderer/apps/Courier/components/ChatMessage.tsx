import { useEffect, useMemo } from 'react';
// import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { Bubble, MenuItemProps } from '@holium/design-system';
import { useContextMenu } from 'renderer/components';
import { useChatStore } from '../store';
import { ChatMessageType } from '../models';

type ChatMessageProps = {
  message: ChatMessageType;
  canReact: boolean;
  ourColor: string;
  onLoad: () => void;
};

export const ChatMessagePresenter = ({
  message,
  canReact,
  ourColor,
  onLoad,
}: ChatMessageProps) => {
  const { ship, friends } = useServices();
  const { selectedChat } = useChatStore();
  const isOur = message.sender === ship?.patp;
  const { getOptions, setOptions } = useContextMenu();

  const messageRowId = useMemo(() => `message-row-${message.id}`, [message.id]);
  const isPinned = selectedChat?.isMessagePinned(message.id);
  const { color: authorColor } = useMemo(() => {
    return friends.getContactAvatarMetadata(message.sender);
  }, []);
  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    if (!selectedChat || !ship) return menu;
    const isAdmin = selectedChat.isHost(ship.patp);
    if (isAdmin) {
      menu.push({
        id: `${messageRowId}-pin-message`,
        icon: isPinned ? 'Unpin' : 'Pin',
        label: isPinned ? 'Unpin' : 'Pin',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
          selectedChat.setPinnedMessage(message.id);
        },
      });
    }
    menu.push({
      id: `${messageRowId}-reply-to`,
      icon: 'Reply',
      label: 'Reply',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        selectedChat.setReplying(message);
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
          selectedChat.setEditing(message);
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
          selectedChat.deleteMessage(message.id);
        },
      });
    }
    return menu.filter(Boolean) as MenuItemProps[];
  }, [messageRowId, isPinned]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(messageRowId)) {
      setOptions(messageRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, messageRowId]);

  return (
    <Bubble
      id={messageRowId}
      isOur={isOur}
      ourColor={ourColor}
      isEditing={selectedChat?.isEditing(message.id)}
      isEdited={message.metadata?.edited}
      author={message.sender}
      authorColor={authorColor}
      message={message.contents}
      sentAt={new Date(message.createdAt).toISOString()}
      onLoad={onLoad}
      onReaction={canReact ? () => {} : undefined}
    />
  );
};

export const ChatMessage = observer(ChatMessagePresenter);
