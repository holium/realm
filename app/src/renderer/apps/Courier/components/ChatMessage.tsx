import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
// import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import {
  Bubble,
  MenuItemProps,
  OnReactionPayload,
} from '@holium/design-system';
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
  const messageRef = useRef<HTMLDivElement>(null);
  const isOur = message.sender === ship?.patp;
  const { getOptions, setOptions } = useContextMenu();
  useEffect(() => {
    if (!ship) return;
    window.ship = ship.patp;
  }, []);

  const messageRowId = useMemo(() => `message-row-${message.id}`, [message.id]);
  const isPinned = selectedChat?.isMessagePinned(message.id);
  const { color: authorColor } = useMemo(() => {
    return friends.getContactAvatarMetadata(message.sender);
  }, []);
  const [reactions, setReactions] = useState([]);
  const msgModel = selectedChat?.messages.find((m) => m.id === message.id);
  useEffect(() => {
    const msgModel = selectedChat?.messages.find((m) => m.id === message.id);
    if (!msgModel) return;
    msgModel.fetchReactions().then((reacts: any) => {
      setReactions(reacts);
    });
  }, [msgModel?.reactions.length]);

  const onReaction = useCallback(
    (payload: OnReactionPayload) => {
      console.log('onReaction', payload);
      if (payload.action === 'add') {
        selectedChat?.sendReaction(message.id, payload.emoji);
      } else {
        selectedChat?.deleteReaction(message.id, payload.emoji);
      }
    },
    [selectedChat, message.id]
  );

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
      id: `${messageRowId}-react-to`,
      icon: 'Emoji',
      label: 'React',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        selectedChat.setReacting(message.id);
      },
    });
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
      ref={messageRef}
      id={messageRowId}
      isOur={isOur}
      ourShip={ship?.patp}
      ourColor={ourColor}
      isEditing={selectedChat?.isEditing(message.id)}
      isEdited={message.metadata?.edited}
      author={message.sender}
      authorColor={authorColor}
      message={message.contents}
      sentAt={new Date(message.createdAt).toISOString()}
      onLoad={onLoad}
      reactions={reactions}
      onReaction={canReact ? onReaction : undefined}
    />
  );
};

export const ChatMessage = observer(ChatMessagePresenter);
