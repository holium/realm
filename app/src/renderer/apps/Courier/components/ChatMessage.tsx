import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import {
  Bubble,
  convertFragmentsToText,
  MenuItemProps,
  OnReactionPayload,
} from '@holium/design-system';

import { useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatMessageType } from '../../../stores/models/chat.model';

type ChatMessageProps = {
  containerWidth: number;
  message: ChatMessageType;
  ourColor: string;
  isPrevGrouped: boolean;
  isNextGrouped: boolean;
  onReplyClick?: (msgId: string) => void;
};

export const ChatMessagePresenter = ({
  containerWidth,
  message,
  ourColor,
  isPrevGrouped,
  isNextGrouped,
  onReplyClick,
}: ChatMessageProps) => {
  const { loggedInAccount, theme } = useAppState();
  const { chatStore, friends } = useShipStore();
  const { selectedChat } = chatStore;
  const messageRef = useRef<HTMLDivElement>(null);
  const ourShip = useMemo(() => loggedInAccount?.serverId, [loggedInAccount]);
  const isOur = message.sender === ourShip;
  const { getOptions, setOptions, defaultOptions } = useContextMenu();

  const messageRowId = useMemo(() => `message-row-${message.id}`, [message.id]);
  const isPinned = selectedChat?.isMessagePinned(message.id);
  const { color: authorColor, nickname: authorNickname } = useMemo(() => {
    return friends.getContactAvatarMetadata(message.sender);
  }, []);

  const msgModel = useMemo(
    () => selectedChat?.messages.find((m) => m.id === message.id),
    [message.id, message.updatedAt]
  );
  const canReact = useMemo(
    () => selectedChat?.metadata.reactions,
    [selectedChat?.metadata.reactions]
  );

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
    const menu: MenuItemProps[] = [defaultOptions[0]];
    if (!selectedChat || !loggedInAccount) return menu;
    const isAdmin = selectedChat.isHost(loggedInAccount.serverId);
    let hasLink = false;
    let hasImage = false;
    msgModel?.contents.forEach((content) => {
      if (Object.keys(content)[0].includes('image')) {
        hasImage = true;
      }
      if (Object.keys(content)[0].includes('link')) {
        hasLink = true;
      }
    });
    if (isAdmin) {
      menu.push({
        id: `${messageRowId}-pin-message`,
        icon: isPinned ? 'Unpin' : 'Pin',
        label: isPinned ? 'Unpin' : 'Pin',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          selectedChat.setPinnedMessage(message.id);
        },
      });
    }
    if (hasImage) {
      menu.push({
        id: `${messageRowId}-save-image`,
        icon: 'CloudDownload',
        label: 'Save image',
        disabled: false,
        onClick: (
          evt: React.MouseEvent<HTMLDivElement>,
          elem: HTMLElement | undefined
        ) => {
          evt.stopPropagation();
          const images =
            msgModel &&
            msgModel.contents.filter((c) =>
              Object.keys(c)[0].includes('image')
            );
          if (elem) {
            let asImage = elem as HTMLImageElement;
            if (
              images &&
              images.length > 0 &&
              asImage.src &&
              images.find((i) => i.image === asImage.src)
            )
              MainIPC.downloadUrlAsFile(asImage.src);
          } else if (images && images.length > 0) {
            MainIPC.downloadUrlAsFile(images[0].image);
          }
        },
      });
      // TODO if trove is installed
      // save to trove

      menu.push({
        id: `${messageRowId}-copy-image-link`,
        icon: 'Image',
        label: 'Copy image link',
        disabled: false,
        onClick: (
          evt: React.MouseEvent<HTMLDivElement>,
          elem: HTMLElement | undefined
        ) => {
          evt.stopPropagation();
          const images =
            msgModel &&
            msgModel.contents.filter((c) =>
              Object.keys(c)[0].includes('image')
            );
          if (elem) {
            let asImage = elem as HTMLImageElement;
            if (
              images &&
              images.length > 0 &&
              asImage.src &&
              images.find((i) => i.image === asImage.src)
            ) {
              navigator.clipboard.writeText(asImage.src);
            } else if (images && images.length > 0) {
              navigator.clipboard.writeText(images[0].image);
            }
          } else if (images && images.length > 0) {
            navigator.clipboard.writeText(images[0].image);
          }
        },
      });
    }
    if (hasLink) {
      menu.push({
        id: `${messageRowId}-copy-link`,
        icon: 'UrlLink',
        label: 'Copy url',
        disabled: false,
        onClick: (
          evt: React.MouseEvent<HTMLDivElement>,
          elem: HTMLElement | undefined
        ) => {
          evt.stopPropagation();
          const links =
            msgModel &&
            msgModel.contents.filter((c) => Object.keys(c)[0].includes('link'));
          if (elem) {
            let asImage = elem as HTMLAnchorElement;
            if (
              links &&
              links.length > 0 &&
              asImage.href &&
              links.find((i) => i.link === asImage.href)
            ) {
              navigator.clipboard.writeText(asImage.href);
            } else if (links && links.length > 0) {
              navigator.clipboard.writeText(links[0].link);
            }
          } else if (links && links.length > 0) {
            navigator.clipboard.writeText(links[0].link);
          }
        },
      });
    }
    menu.push({
      id: `${messageRowId}-copy-raw-message`,
      icon: 'CopyMessage',
      label: 'Copy message',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        const msg: string = convertFragmentsToText(message.contents);
        navigator.clipboard.writeText(msg);
      },
    });
    menu.push({
      id: `${messageRowId}-reply-to`,
      icon: 'Reply',
      label: 'Reply',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
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
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          selectedChat.setEditing(message);
        },
      });
    }
    if (isAdmin || isOur) {
      menu.push({
        id: `${messageRowId}-delete-message`,
        label: 'Delete message',
        icon: 'Trash',
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          selectedChat.deleteMessage(message.id);
        },
      });
    }
    return menu.filter(Boolean) as MenuItemProps[];
  }, [messageRowId, isPinned, defaultOptions]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(messageRowId)) {
      setOptions(messageRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, messageRowId]);

  const sentAt = useMemo(
    () => new Date(message.createdAt).toISOString(),
    [message.createdAt]
  );

  const hasEdited = useMemo(
    () => message.metadata.edited,
    [message.updatedAt, message.metadata.edited]
  );

  const reactionList = useMemo(
    () => msgModel?.reactions,
    [
      msgModel?.reactions,
      msgModel?.reactions.length,
      msgModel?.reactions.length === 0,
    ]
  );

  const messages = selectedChat?.messages || [];

  let mergedContents: any | undefined = useMemo(() => {
    const replyTo = message.replyToMsgId;
    let replyToObj = {
      reply: { msgId: replyTo, author: 'unknown', message: [{ plain: '' }] },
    };
    if (replyTo) {
      const originalMsg = toJS(messages.find((m) => m.id === replyTo));
      if (originalMsg) {
        let { nickname } = friends.getContactAvatarMetadata(
          originalMsg?.sender
        );
        replyToObj = originalMsg && {
          reply: {
            msgId: originalMsg.id,
            author: nickname || originalMsg.sender,
            message: originalMsg.contents,
          },
        };
      }
      return [replyToObj, ...message.contents];
    } else {
      return message.contents;
    }
  }, [
    message.replyToMsgId,
    message.contents,
    message.updatedAt,
    messages,
    friends,
  ]);

  return (
    <Bubble
      innerRef={messageRef}
      id={messageRowId}
      isPrevGrouped={isPrevGrouped}
      isNextGrouped={isNextGrouped}
      expiresAt={message.expiresAt}
      containerWidth={containerWidth}
      themeMode={theme.mode as 'light' | 'dark'}
      isOur={isOur}
      ourShip={ourShip}
      ourColor={ourColor}
      isEditing={selectedChat?.isEditing(message.id)}
      updatedAt={message.updatedAt}
      isEdited={hasEdited}
      author={message.sender}
      authorNickname={authorNickname}
      authorColor={authorColor}
      message={mergedContents}
      sentAt={sentAt}
      reactions={reactionList}
      onReaction={canReact ? onReaction : undefined}
      onReplyClick={onReplyClick}
    />
  );
};

export const ChatMessage = observer(ChatMessagePresenter);
