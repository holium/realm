import { useState } from 'react';
import {
  Flex,
  Text,
  Icon,
  Button,
  TextInput,
  Avatar,
} from '@holium/design-system';
import { useTrayApps } from '../store';
import { useChatStore } from './store';
import { ShipSearch } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { ChatPathType } from 'os/services/chat/chat.service';

export const NewChat = () => {
  const { ship, friends } = useServices();
  const { dimensions } = useTrayApps();
  const { setSubroute } = useChatStore();
  const [searchString, setSearchString] = useState<string>('');
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());

  const onCreateChat = () => {
    let title: string;
    let chatType: ChatPathType;
    if (selectedPatp.size === 1) {
      chatType = 'dm';
      const metadata = friends.getContactAvatarMetadata(
        Array.from(selectedPatp)[0]
      );
      title = metadata.nickname || metadata.patp;
    } else {
      title = Array.from(selectedPatp)
        .map((patp: string) => {
          const metadata = friends.getContactAvatarMetadata(patp);
          return metadata.nickname || metadata.patp;
        })
        .join(', ');
      chatType = 'group';
    }
    ChatDBActions.createChat(Array.from(selectedPatp), chatType, {
      title,
      description: '',
      image: '',
      creator: ship!.patp,
      timestamp: Date.now().toString(),
    }).then(() => {
      setSubroute('inbox');
    });
  };

  const onShipSelected = (contact: [string, string?]) => {
    const patp = contact[0];
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    setSearchString('');
  };

  const onShipRemove = (contact: [string, string?]) => {
    selectedPatp.delete(contact[0]);
    setSelected(new Set(selectedPatp));
  };

  return (
    <Flex gap={8} height={dimensions.height - 14} flexDirection="column">
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
          {selectedPatp.size > 0 && (
            <Button.TextButton
              showOnHover
              onClick={(evt) => {
                evt.stopPropagation();
                onCreateChat();
              }}
            >
              Create
            </Button.TextButton>
          )}
        </Flex>
      </Flex>
      <TextInput
        id="dm-search"
        name="dm-search"
        width={dimensions.width - 34}
        borderRadius={16}
        height={32}
        placeholder="Search by Urbit ID or nickname"
        leftAdornment={<Icon name="Search" ml={1} size={18} opacity={0.3} />}
        onChange={(evt: any) => {
          evt.stopPropagation();
          setSearchString(evt.target.value);
        }}
      />
      {selectedPatp.size > 0 && (
        <SelectedShips ships={selectedPatp} onRemove={onShipRemove} />
      )}
      <ShipSearch
        search={searchString}
        selected={selectedPatp}
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
    background-color: var(--rlm-intent-alert-color);
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
  const { friends } = useServices();

  return (
    <Flex py={1} gap={12}>
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
