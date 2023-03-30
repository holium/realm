import { useEffect, useMemo, useState } from 'react';
import { Flex, MenuItemProps, PinnedMessage } from '@holium/design-system';
import { useContextMenu } from 'renderer/components';
import { useChatStore } from '../store';
import { ChatMessageType } from '../models';
import { useServices } from 'renderer/logic/store';

type PinnedContainerProps = {
  message: ChatMessageType;
};

export const PinnedContainer = ({ message }: PinnedContainerProps) => {
  const { selectedChat } = useChatStore();
  const { ship, friends } = useServices();
  // are we an admin of the chat?
  const { getOptions, setOptions } = useContextMenu();
  const [authorColor, setAuthorColor] = useState<string | undefined>();

  const pinnedRowId = useMemo(() => `pinned-${message.id}`, [message.id]);
  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    if (!selectedChat || !ship) return menu;
    const isAdmin = selectedChat.isHost(ship.patp);

    menu.push({
      id: `${pinnedRowId}-hide-pinned`,
      icon: 'EyeOff',
      label: 'Hide pin',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        selectedChat.setHidePinned(true);
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
          selectedChat.clearPinnedMessage(message.id);
        },
      });
    }
    return menu.filter(Boolean) as MenuItemProps[];
  }, [pinnedRowId]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(pinnedRowId)) {
      setOptions(pinnedRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, pinnedRowId]);

  useEffect(() => {
    const contact = friends.getContactAvatarMetadata(message.sender);
    // NOTE: #000 is the default color, so we want to default to undefined
    // and use the accent color instead
    if (contact && contact.color !== '#000') {
      setAuthorColor(contact.color);
    }
  }, [message.sender]);

  return (
    <Flex
      width="100%"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      height={46}
      transition={{ duration: 0.2 }}
    >
      <PinnedMessage
        id={pinnedRowId}
        author={message.sender}
        authorColor={authorColor}
        message={message.contents}
        sentAt={new Date(message.createdAt).toISOString()}
        onClick={() => {
          console.log('clicked pinned message');
        }}
      />
    </Flex>
  );
};
