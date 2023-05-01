import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import {
  convertDarkText,
  Flex,
  MenuItemProps,
  PinnedMessage,
} from '@holium/design-system';

import { useContextMenu } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatMessageType } from '../../../stores/models/chat.model';
type PinnedContainerProps = {
  message: ChatMessageType;
};

const BlurredBG = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  .pinned-or-reply-message {
    border-radius: 2px;
    backdrop-filter: blur(24px);
    background: rgba(var(--rlm-window-rgba));
    width: calc(100% + 2px);
    &:hover {
      backdrop-filter: blur(24px);
      background: rgba(var(--rlm-window-rgba));
    }
  }
`;

export const PinnedContainer = ({ message }: PinnedContainerProps) => {
  const { chatStore } = useShipStore();
  const { selectedChat } = chatStore;
  const { friends } = useShipStore();
  const { loggedInAccount, theme } = useAppState();
  // are we an admin of the chat?
  const { getOptions, setOptions } = useContextMenu();
  const [authorColor, setAuthorColor] = useState<string | undefined>();

  const pinnedRowId = useMemo(() => `pinned-${message.id}`, [message.id]);
  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    if (!selectedChat || !loggedInAccount) return menu;
    const isAdmin = selectedChat.isHost(loggedInAccount.patp);

    menu.push({
      id: `${pinnedRowId}-hide-pinned`,
      icon: 'EyeOff',
      label: 'Hide pin',
      disabled: false,
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
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
        onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
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
    const authorColorDisplay =
      (contact.color && convertDarkText(contact.color, theme.mode)) ||
      'rgba(var(--rlm-text-rgba))';

    setAuthorColor(authorColorDisplay);
  }, [message.sender]);

  return (
    <Flex
      width="calc(100% + 2px)"
      position="absolute"
      top={0}
      left={0}
      right={0}
      zIndex={20}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      height={46}
      transition={{ duration: 0.2 }}
    >
      <BlurredBG>
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
      </BlurredBG>
    </Flex>
  );
};
