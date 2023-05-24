import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import {
  Avatar,
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
  TextInput,
  Tooltip,
} from '@holium/design-system';

import { ChatPathType } from 'os/services/ship/chat/chat.types';
import { ShipSearch } from 'renderer/components/ShipSearch';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../../store';

export const NewChat = () => {
  const { loggedInAccount } = useAppState();
  const { friends, chatStore } = useShipStore();
  const { dimensions } = useTrayApps();
  const { inbox, setSubroute, createChat } = chatStore;
  const [creating, setCreating] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const [selectedIdentity, setSelected] = useState<Set<string>>(new Set());

  const onCreateChat = () => {
    let title: string;
    let chatType: ChatPathType;
    if (!loggedInAccount) return;
    if (selectedIdentity.size === 1) {
      chatType = 'dm';
      const metadata = friends.getContactAvatarMetadata(
        Array.from(selectedIdentity)[0]
      );
      title = metadata.nickname || metadata.patp;
    } else {
      title = Array.from(selectedIdentity)
        .map((patp: string) => {
          const metadata = friends.getContactAvatarMetadata(patp);
          return metadata.nickname || metadata.patp;
        })
        .join(', ');
      chatType = 'group';
    }
    setCreating(true);
    createChat(
      title,
      loggedInAccount.serverId,
      chatType,
      Array.from(selectedIdentity)
    )
      .then(() => {
        setSubroute('inbox');
        setCreating(false);
      })
      .catch((err) => {
        console.log(err);
        setCreating(false);
      });
  };

  const onShipSelected = (contact: [string, string?]) => {
    const patp = contact[0];
    selectedIdentity.add(patp);
    setSelected(new Set(selectedIdentity));
    setSearchString('');
  };

  const onShipRemove = (contact: [string, string?]) => {
    selectedIdentity.delete(contact[0]);
    setSelected(new Set(selectedIdentity));
  };

  const dmAlreadyExists = useMemo(() => {
    if (selectedIdentity.size !== 1) return false;
    return inbox.some((chat) => {
      return (
        chat.type === 'dm' &&
        chat.peers.find((p: any) => p.ship === Array.from(selectedIdentity)[0])
      );
    });
  }, [selectedIdentity.size === 1]);

  return (
    <Flex gap={4} height={dimensions.height - 14} flexDirection="column">
      <Flex minHeight={32} height={36} flexDirection="row" alignItems="center">
        <Flex width={120}>
          <Button.IconButton
            size={26}
            onClick={(evt) => {
              evt.stopPropagation();
              setSubroute('inbox');
            }}
          >
            <Icon name="ArrowLeftLine" size={22} opacity={0.5} />
          </Button.IconButton>
        </Flex>
        <Text.Custom
          fontSize={3}
          width="100%"
          textAlign="center"
          fontWeight={500}
        >
          New Chat
        </Text.Custom>
        <Flex width={120} alignItems="flex-start" justifyContent="flex-end">
          {selectedIdentity.size > 0 && (
            <Tooltip
              id="create-chat-tooltip"
              show={dmAlreadyExists}
              placement="bottom-left"
              content={'Chat already exists'}
            >
              <Button.TextButton
                showOnHover
                disabled={creating || dmAlreadyExists}
                onClick={(evt) => {
                  evt.stopPropagation();
                  onCreateChat();
                }}
              >
                {creating ? <Spinner size={0} color="#FFF" /> : 'Create'}
              </Button.TextButton>
            </Tooltip>
          )}
        </Flex>
      </Flex>
      <TextInput
        id="dm-search"
        name="dm-search"
        width={dimensions.width - 34}
        borderRadius={16}
        height={32}
        placeholder="Search by identity or nickname"
        leftAdornment={<Icon name="Search" ml={1} size={18} opacity={0.3} />}
        onChange={(evt: any) => {
          evt.stopPropagation();
          setSearchString(evt.target.value);
        }}
      />
      {selectedIdentity.size > 0 && (
        <SelectedShips ships={selectedIdentity} onRemove={onShipRemove} />
      )}
      <ShipSearch
        search={searchString}
        selected={selectedIdentity}
        onSelected={(contact: any) => onShipSelected(contact)}
      />
    </Flex>
  );
};

type SelectedShipsProps = {
  ships: Set<string>;
  onRemove: (contact: [string, string?]) => void;
};

const RemoveWrapper = styled(motion.div)`
  position: absolute;
  z-index: 4;
  top: -6px;
  right: -6px;

  .new-chat-remove-ship {
    justify-content: center;
    align-items: center;
    background-color: rgba(var(--rlm-intent-alert-rgba));
    svg {
      fill: #fff;
    }
    transition: var(--transition);
    &:hover {
      transition: var(--transition);
      filter: brightness(0.95);
    }
  }
`;

const SelectedShips = ({ ships, onRemove }: SelectedShipsProps) => {
  const { friends } = useShipStore();

  return (
    <Flex height="98px" py={1} gap={12} overflowY="scroll">
      {Array.from(ships).map((ship) => {
        const metadata = ship
          ? friends.getContactAvatarMetadata(ship)
          : { patp: ship, color: '#000', nickname: '', avatar: '' };

        return (
          <Flex
            key={ship}
            width={50}
            position="relative"
            flexDirection="column"
          >
            <Avatar
              patp={metadata.patp}
              avatar={metadata.avatar}
              size={50}
              sigilColor={[metadata.color, '#ffffff']}
              simple
            />
            <Text.Custom mt={1} width={50} truncate opacity={0.7} fontSize={1}>
              {metadata.nickname || ship}
            </Text.Custom>
            <RemoveWrapper>
              <Button.Base
                className="new-chat-remove-ship"
                size={18}
                borderRadius={11}
                onClick={(evt) => {
                  evt.stopPropagation();
                  onRemove([ship, '']);
                }}
              >
                <Icon name="Close" size={16} />
              </Button.Base>
            </RemoveWrapper>
          </Flex>
        );
      })}
    </Flex>
  );
};
