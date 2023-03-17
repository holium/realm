import { useMemo } from 'react';
import {
  Flex,
  Button,
  Text,
  Icon,
  Menu,
  MenuItemProps,
} from '@holium/design-system';
import { useChatStore } from '../store';
import { useServices } from 'renderer/logic/store';

type ChatLogHeaderProps = {
  path: string;
  title: string;
  subtitle?: string;
  avatar: React.ReactNode;
  onBack: () => void;
  hasMenu: boolean;
  rightAction?: React.ReactNode;
};

export const ChatLogHeader = ({
  path,
  title,
  subtitle,
  avatar,
  onBack,
  rightAction,
  hasMenu = true,
}: ChatLogHeaderProps) => {
  const { ship } = useServices();
  const { selectedChat, setSubroute } = useChatStore();

  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    if (!selectedChat || !ship) return menu;
    const isAdmin = selectedChat.isHost(ship.patp);
    menu.push({
      id: 'chat-info',
      icon: 'Info',
      label: 'Info',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        setSubroute('chat-info');
      },
    });
    menu.push({
      id: 'mute-chat',
      icon: 'NotificationOff',
      label: 'Mute',
      disabled: true,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
      },
    });
    if (selectedChat?.hidePinned) {
      menu.push({
        id: 'show-hidden-pinned',
        icon: 'EyeOn',
        label: 'Show hidden pins',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
          selectedChat.setHidePinned(false);
        },
      });
    }
    if (isAdmin) {
      menu.push({
        id: 'clear-history',
        icon: 'ClearHistory',
        section: 2,
        label: 'Clear history',
        disabled: false,
        onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
          selectedChat.clearChatBacklog();
        },
      });
    }

    menu.push({
      id: 'leave-chat',
      icon: 'Trash',
      section: 2,
      iconColor: '#ff6240',
      labelColor: '#ff6240',
      label: 'Delete chat',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
      },
    });
    return menu.filter(Boolean) as MenuItemProps[];
  }, [selectedChat?.hidePinned]);

  return (
    <Flex
      pt="2px"
      pr="2px"
      pb={12}
      gap={12}
      height={40}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={8}
      >
        <Button.IconButton
          size={26}
          onClick={(evt) => {
            evt.stopPropagation();
            onBack();
          }}
        >
          <Icon name="ArrowLeftLine" size={22} opacity={0.5} />
        </Button.IconButton>
        <Flex flexDirection="row" gap={12} alignItems="center" flex={1}>
          <Flex
            layoutId={`chat-${path}-avatar`}
            layout="preserve-aspect"
            transition={{
              duration: 0.15,
            }}
          >
            {avatar}
          </Flex>
          <Flex alignItems="flex-start" flexDirection="column">
            <Text.Custom
              truncate
              width={255}
              layoutId={`chat-${path}-name`}
              layout="preserve-aspect"
              textAlign="left"
              transition={{
                duration: 0.15,
              }}
              fontWeight={500}
              fontSize={3}
            >
              {title}
            </Text.Custom>
            {subtitle && (
              <Text.Custom
                textAlign="left"
                layoutId={`chat-${path}-subtitle`}
                layout="preserve-aspect"
                transition={{
                  duration: 0.15,
                }}
                width={210}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5, lineHeight: '1' }}
                fontSize={2}
              >
                {subtitle}
              </Text.Custom>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex>
        {rightAction}
        {hasMenu && (
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
        )}
      </Flex>
    </Flex>
  );
};
