import { useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Button, Flex, Icon } from '@holium/design-system/general';
import { Menu, MenuItemProps } from '@holium/design-system/navigation';

import { StartRoomButton } from 'renderer/components/StartRoomButton/StartRoomButton';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatLogHeaderContent } from './ChatLogHeaderContent';

const ChatLogHeaderContainer = styled(Flex)<{ isStandaloneChat: boolean }>`
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px 0;

  ${({ isStandaloneChat }) =>
    isStandaloneChat &&
    `
    height: 58px;
    padding: 12px;
    background: var(--rlm-window-color);
    border-bottom: 1px solid var(--rlm-base-color);
  `}
`;

type Props = {
  path: string;
  isMuted: boolean;
  hasMenu: boolean;
  forceBackButton?: boolean;
  isStandaloneChat?: boolean;
  onBack: () => void;
};

const ChatLogHeaderPresenter = ({
  path,
  isMuted,
  hasMenu = true,
  forceBackButton = false,
  isStandaloneChat = false,
  onBack,
}: Props) => {
  const { loggedInAccount, shellStore } = useAppState();
  const { chatStore } = useShipStore();
  const { selectedChat, setSubroute, toggleMuted } = chatStore;
  const isSpaceChat = selectedChat?.type === 'space';

  const chatLogId = useMemo(() => `chat-log-${path}`, [path]);

  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    if (!selectedChat || !loggedInAccount) return menu;
    const isAdmin = selectedChat.isHost(loggedInAccount.serverId);
    menu.push({
      id: `${chatLogId}-chat-info`,
      icon: 'Info',
      label: 'Info',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        setSubroute('chat-info');
      },
    });
    menu.push({
      id: `${chatLogId}-mute-chat`,
      icon: isMuted ? 'NotificationOff' : 'Notification',
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        toggleMuted(path, !isMuted);
      },
    });
    if (selectedChat?.hidePinned) {
      menu.push({
        id: `${chatLogId}-show-hidden-pinned`,
        icon: 'EyeOn',
        label: 'Show hidden pins',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          selectedChat.setHidePinned(false);
        },
      });
    }
    if (isAdmin) {
      menu.push({
        id: `${chatLogId}-clear-history`,
        icon: 'ClearHistory',
        section: 2,
        label: 'Clear history',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          selectedChat.clearChatBacklog();
        },
      });
    }
    if (!isSpaceChat) {
      menu.push({
        id: `${chatLogId}-leave-chat`,
        icon: isAdmin ? 'Trash' : 'Logout',
        section: 2,
        iconColor: '#ff6240',
        labelColor: '#ff6240',
        label: isAdmin ? 'Delete chat' : 'Leave chat',
        disabled: false,
        onClick: () => {
          shellStore.setIsBlurred(true);
          shellStore.openDialogWithStringProps('leave-chat-dialog', {
            path,
            amHost: isAdmin.toString(),
            our: loggedInAccount.serverId,
          });
        },
      });
    }

    return menu.filter(Boolean) as MenuItemProps[];
  }, [selectedChat?.hidePinned, isMuted]);

  return (
    <ChatLogHeaderContainer isStandaloneChat={isStandaloneChat}>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={8}
      >
        {(!isStandaloneChat || forceBackButton) && (
          <Button.IconButton
            size={26}
            onClick={(evt) => {
              evt.stopPropagation();
              onBack();
            }}
          >
            <Icon name="ArrowLeftLine" size={22} opacity={0.5} />
          </Button.IconButton>
        )}
        <ChatLogHeaderContent isStandaloneChat={isStandaloneChat} />
      </Flex>
      <Flex gap="12px" alignItems="center">
        {hasMenu && (
          <>
            <StartRoomButton />
            <Menu
              id={`chat-${path}-menu`}
              orientation="bottom-left"
              offset={{ x: 2, y: 2 }}
              triggerEl={
                <Button.IconButton size={26}>
                  <Icon name="MoreHorizontal" size={22} opacity={0.5} />
                </Button.IconButton>
              }
              options={contextMenuOptions}
            />
          </>
        )}
      </Flex>
    </ChatLogHeaderContainer>
  );
};

export const ChatLogHeader = observer(ChatLogHeaderPresenter);
