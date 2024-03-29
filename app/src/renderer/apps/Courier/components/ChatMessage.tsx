import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import {
  Bubble,
  convertFragmentsToText,
  OnReactionPayload,
} from '@holium/design-system/blocks';
import { MenuItemProps } from '@holium/design-system/navigation';
import { useToggle } from '@holium/design-system/util';

import { SystemTrayRegistry } from 'renderer/apps/registry';
import { useTrayApps } from 'renderer/apps/store';
import { useContextMenu } from 'renderer/components';
import { SharePath, useShareModal } from 'renderer/components/ShareModal';
import { useAppState } from 'renderer/stores/app.store';
import { ChatIPC, MainIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatMessageType } from '../../../stores/models/chat.model';

// We unify similar Emojis across iOS and desktop (iOS taking precedence).
// This is a map of different web emojis to the iOS emoji.
const EMOJI_MAP: Record<string, string> = {
  // For both desktop hearts, use the mobile heart: 2764-fe0f
  '1f606': '2764-fe0f',
  '2665-fe0f': '2764-fe0f',
};

type ChatMessageProps = {
  message: ChatMessageType;
  ourColor: string;
  isPrevGrouped: boolean;
  isNextGrouped: boolean;
  onReplyClick?: (msgId: string) => void;
};

const { dimensions } = SystemTrayRegistry.spaces;

export const getMergedContents: any | undefined = (
  message: ChatMessageType,
  messages: any[],
  friends: any
) => {
  const replyTo = message.replyToMsgId;
  let replyToObj = {
    reply: { msgId: replyTo, author: 'unknown', message: [{ plain: '' }] },
  };
  if (replyTo) {
    const originalMsg = toJS(messages.find((m) => m.id === replyTo));
    if (originalMsg) {
      const { nickname } = friends.getContactAvatarMetadata(
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
};

export const ChatMessagePresenter = ({
  message,
  ourColor,
  isPrevGrouped,
  isNextGrouped,
  onReplyClick,
}: ChatMessageProps) => {
  const { loggedInAccount, theme } = useAppState();
  const { chatStore, friends, spacesStore } = useShipStore();
  const {
    activeApp,
    setActiveApp,
    setTrayAppCoords,
    setTrayAppDimensions,
    coords,
  } = useTrayApps();
  const { selectedChat, inbox, getChatHeader } = chatStore;
  const messageRef = useRef<HTMLDivElement>(null);
  const ourShip = useMemo(() => loggedInAccount?.serverId, [loggedInAccount]);
  const isOur = message.sender === ourShip;
  const { getOptions, setOptions, defaultOptions } = useContextMenu();
  const { setObject, setPaths } = useShareModal();

  const deleting = useToggle(false);

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
      const emoji =
        payload.emoji in EMOJI_MAP ? EMOJI_MAP[payload.emoji] : payload.emoji;

      if (payload.action === 'add') {
        selectedChat?.sendReaction(message.id, emoji);
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
            const asImage = elem as HTMLImageElement;
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
            const asImage = elem as HTMLImageElement;
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
            const asImage = elem as HTMLAnchorElement;
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
    menu.push({
      id: `${messageRowId}-forward`,
      icon: 'ShareArrow',
      label: 'Forward',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        const forwardedPathTitle: string =
          selectedChat.type === 'dm'
            ? `DM with ${selectedChat.metadata.title}`
            : selectedChat.metadata.title;
        setObject({
          app: 'Courier',
          icon: 'CourierApp',
          dataTypeName: 'message',
          mergedContents: getMergedContents(message, messages, friends),
          message,
          forwardedPathTitle,
          share: (o: any, paths: SharePath[]) => {
            const frags = o.message.contents.map((c: any) => {
              return {
                content: {
                  [Object.keys(c)[0]]: c[Object.keys(c)[0]],
                },
                'reply-to': o.message.replyToMsgId
                  ? {
                      path: o.message.replyToPath,
                      'msg-id': o.message.replyToMsgId,
                    }
                  : null,
                metadata: {
                  ...c.metadata,
                  forwardedId: o.message.id,
                  forwardedPath: o.message.path,
                  forwardedPathTitle: o.forwardedPathTitle,
                },
              };
            });
            paths.forEach((pathObj: SharePath) => {
              selectedChat.forwardMessage(pathObj.path, frags);
            });
            setObject(null);
          },
        });
        setPaths(
          inbox.map((c) => ({
            ...getChatHeader(c.path),
            path: c.path,
            selected: false,
            metadata: c.metadata,
            type: c.type,
            peers: c.peers.map((peer) => peer.ship),
            space: spacesStore.getSpaceByChatPath(c.path),
          }))
        );
      },
    });
    if (isOur && !message.pending) {
      // don't allow people to edit pending messages
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
        onClick: async (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          deleting.toggleOn();
          await selectedChat.deleteMessage(message.id);
          deleting.toggleOff();
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

  const mergedContents: any | undefined = useMemo(() => {
    return getMergedContents(message, messages, friends);
  }, [
    message.replyToMsgId,
    message.contents,
    message.updatedAt,
    messages,
    friends,
  ]);

  const joiner = useCallback(
    (path: string) => {
      if (spacesStore.allSpacePaths.includes(path)) {
        throw new Error('you are already in this space');
      }
      setTrayAppCoords({
        left: 55,
        bottom: coords.bottom,
      });
      setTrayAppDimensions(dimensions);
      spacesStore.setJoin('initial');
      spacesStore.setSearchVisible(true);
      spacesStore.setSearchPath(path);
      setActiveApp('spaces-tray');
      spacesStore.setJoin('loading');
      spacesStore.joinSpace(path.replace(/^\/spaces/, ''));
    },
    [
      activeApp,
      setTrayAppCoords,
      setTrayAppDimensions,
      setActiveApp,
      spacesStore,
    ]
  );

  const onJoinChatClick = useCallback(
    (path: string, host?: string) => {
      const chat = chatStore.inbox.find((i) => i.path === path);
      if (chat) {
        throw new Error('you are already in this space');
      }
      if (!loggedInAccount) {
        throw new Error('you are not logged in');
      }
      chatStore.setSubroute('inbox');

      ChatIPC.addPeerToChat(path, loggedInAccount.serverId, host)
        .then(() => {
          console.log('joining chat', path);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [chatStore, loggedInAccount]
  );

  let forwardedFrom: string | undefined = undefined;
  if (message.metadata.forwardedPathTitle) {
    forwardedFrom = message.metadata.forwardedPathTitle;
  } else if (message.metadata.forwardedPath) {
    forwardedFrom = getChatHeader(message.metadata.forwardedPath).title;
  }
  return (
    <Bubble
      innerRef={messageRef}
      id={messageRowId}
      isPrevGrouped={isPrevGrouped}
      isNextGrouped={isNextGrouped}
      expiresAt={message.expiresAt}
      themeMode={theme.mode as 'light' | 'dark'}
      isOur={isOur}
      ourShip={ourShip}
      ourColor={ourColor}
      isEditing={selectedChat?.isEditing(message.id)}
      isDeleting={deleting.isOn}
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
      onJoinSpaceClick={joiner}
      onJoinChatClick={onJoinChatClick}
      allSpacePaths={spacesStore.allSpacePaths}
      allChatPaths={chatStore.allChatPaths}
      error={message.error}
      forwardedFrom={forwardedFrom}
    />
  );
};

export const ChatMessage = observer(ChatMessagePresenter);
