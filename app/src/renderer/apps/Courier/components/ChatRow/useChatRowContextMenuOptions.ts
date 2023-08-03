import { useMemo } from 'react';

import { MenuItemProps } from '@holium/design-system/navigation';

import { Subroutes } from 'renderer/stores/chat.store';
import { MobXAccount } from 'renderer/stores/models/account.model';

type Props = {
  path: string;
  isPinned: boolean;
  isMuted: boolean;
  isAdmin: boolean;
  isSpaceChat: boolean;
  isOpenChat: boolean;
  chatRowId: string;
  loggedInAccount: MobXAccount | undefined;
  togglePinned: (path: string, isPinned: boolean) => void;
  toggleMuted: (path: string, isMuted: boolean) => void;
  readPath: (type: string, path: string) => void;
  setChat: (path: string) => void;
  setSubroute: (subroute: Subroutes) => void;
  setIsBlurred: (isBlurred: boolean) => void;
  openDialogWithStringProps: (
    dialogId: string,
    props: Record<string, string>
  ) => void;
};

export const useChatRowContextMenuOptions = ({
  path,
  isPinned,
  isMuted,
  isAdmin,
  isSpaceChat,
  isOpenChat,
  chatRowId,
  loggedInAccount,
  togglePinned,
  toggleMuted,
  readPath,
  setChat,
  setSubroute,
  setIsBlurred,
  openDialogWithStringProps,
}: Props) => {
  return useMemo(() => {
    if (!loggedInAccount) return [];

    const menu = [];
    menu.push({
      id: `${chatRowId}-pin-chat`,
      icon: isPinned ? 'Unpin' : 'Pin',
      label: isPinned ? 'Unpin' : 'Pin',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        togglePinned(path, !isPinned);
      },
    });
    menu.push({
      id: `${chatRowId}-read-chat`,
      icon: 'MessageRead',
      label: 'Mark as read',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        readPath('realm-chat', path);
      },
    });
    menu.push({
      id: `${chatRowId}-chat-info`,
      icon: 'Info',
      label: 'Info',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        setChat(path);
        setSubroute('chat-info');
      },
    });
    menu.push({
      id: `${chatRowId}-mute-chat`,
      icon: isMuted ? 'NotificationOff' : 'Notification',
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        toggleMuted(path, !isMuted);
      },
    });
    if (isOpenChat) {
      menu.push({
        id: `${chatRowId}-chat-link`,
        icon: 'Copy',
        label: 'Copy chat link',
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          navigator.clipboard.writeText(path);
        },
      });
    }
    if (!isSpaceChat) {
      menu.push({
        id: `${chatRowId}-leave-chat`,
        label: isAdmin ? 'Delete chat' : 'Leave chat',
        icon: isAdmin ? 'Trash' : 'Logout',
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          setIsBlurred(true);
          openDialogWithStringProps('leave-chat-dialog', {
            path,
            amHost: isAdmin.toString(),
            our: loggedInAccount.serverId,
          });
        },
      });
    }

    return menu.filter(Boolean) as MenuItemProps[];
  }, [
    path,
    isPinned,
    isMuted,
    isAdmin,
    isSpaceChat,
    isOpenChat,
    chatRowId,
    loggedInAccount,
    togglePinned,
    toggleMuted,
    readPath,
    setChat,
    setSubroute,
    setIsBlurred,
    openDialogWithStringProps,
  ]);
};
