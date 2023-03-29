import { useEffect, useRef, useMemo, useCallback } from 'react';
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
  isPrevGrouped: boolean;
  isNextGrouped: boolean;
  containerWidth: number;
  replyTo?: ChatMessageType;
  message: ChatMessageType;
  canReact: boolean;
  ourColor: string;
  measure: () => void;
};

export const ChatMessagePresenter = ({
  containerWidth,
  replyTo,
  message,
  canReact,
  ourColor,
  isPrevGrouped,
  isNextGrouped,
  measure,
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
  const { color: authorColor, nickname: authorNickname } = useMemo(() => {
    return friends.getContactAvatarMetadata(message.sender);
  }, []);

  const msgModel = selectedChat?.messages.find((m) => m.id === message.id);

  const onReaction = useCallback(
    (payload: OnReactionPayload) => {
      if (payload.action === 'add') {
        selectedChat?.sendReaction(message.id, payload.emoji);
      } else {
        if (!payload.reactId) {
          console.warn('No reactId', payload);
          return;
        }
        selectedChat?.deleteReaction(message.id, payload.reactId);
      }
    },
    [selectedChat, message]
  );

  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    if (!selectedChat || !ship) return menu;
    const isAdmin = selectedChat.isHost(ship.patp);
    let hasImage = false;
    msgModel?.contents.forEach((content) => {
      if (Object.keys(content)[0].includes('image')) {
        hasImage = true;
      }
    });
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
    if (hasImage) {
      // menu.push({
      //   id: `${messageRowId}-save-image`,
      //   icon: 'CloudDownload',
      //   label: 'Save image',
      //   disabled: false,
      //   onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
      //     evt.stopPropagation();
      //     // selectedChat.saveImage(message.id);
      //   },
      // });
      // TODO if trove is installed
      // save to trove
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

  const sentAt = useMemo(
    () => new Date(message.createdAt).toISOString(),
    [message.createdAt]
  );

  const hasEdited = useMemo(() => message.metadata.edited, [message.updatedAt]);

  const reactionList = useMemo(
    () => msgModel?.reactions,
    [
      msgModel?.reactions,
      msgModel?.reactions.length,
      msgModel?.reactions.length === 0,
    ]
  );

  return (
    <Bubble
      ref={messageRef}
      id={messageRowId}
      isPrevGrouped={isPrevGrouped}
      isNextGrouped={isNextGrouped}
      expiresAt={message.expiresAt}
      containerWidth={containerWidth}
      isOur={isOur}
      ourShip={ship?.patp}
      ourColor={ourColor}
      isEditing={selectedChat?.isEditing(message.id)}
      isEdited={hasEdited}
      author={message.sender}
      authorNickname={authorNickname}
      authorColor={authorColor}
      message={replyTo ? [replyTo, ...message.contents] : message.contents}
      sentAt={sentAt}
      onMeasure={measure}
      reactions={reactionList}
      onReaction={canReact && !isOur ? onReaction : undefined}
    />
  );
};

export const ChatMessage = observer(ChatMessagePresenter);
