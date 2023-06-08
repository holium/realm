import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import {
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

import { SelectedShips } from './SelectedShips';

type Props = {
  isStandaloneChat?: boolean;
};

const CreateNewChatPresenter = ({ isStandaloneChat = false }: Props) => {
  const { loggedInAccount } = useAppState();
  const { friends, chatStore } = useShipStore();
  const { inbox, setSubroute, createChat } = chatStore;
  const [creating, setCreating] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const [selectedIdentity, setSelectedIdentity] = useState<Set<string>>(
    new Set()
  );

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
    setSelectedIdentity(new Set(selectedIdentity));
    setSearchString('');
  };

  const onShipRemove = (contact: [string, string?]) => {
    selectedIdentity.delete(contact[0]);
    setSelectedIdentity(new Set(selectedIdentity));
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
    <Flex flex={1} gap={4} height="100%" flexDirection="column">
      <Flex
        padding={isStandaloneChat ? '12px' : 0}
        minHeight={isStandaloneChat ? '58px' : '32px'}
      >
        <Flex position="relative" flex={1} alignItems="center">
          {!isStandaloneChat && (
            <Flex position="absolute" left={0} alignItems="center">
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
          )}
          <Text.Custom
            fontSize={3}
            width="100%"
            textAlign="center"
            fontWeight={500}
          >
            New Chat
          </Text.Custom>
          <Flex position="absolute" right={0} alignItems="center">
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
      </Flex>
      <Flex width="100%" padding={isStandaloneChat ? '0 12px 12px 12px' : 0}>
        <TextInput
          id="dm-search"
          name="dm-search"
          width="100%"
          borderRadius={16}
          height={32}
          placeholder="Search by identity or nickname"
          leftAdornment={<Icon name="Search" ml={1} size={18} opacity={0.3} />}
          onChange={(evt: any) => {
            evt.stopPropagation();
            setSearchString(evt.target.value);
          }}
        />
      </Flex>
      {selectedIdentity.size > 0 && (
        <Flex width="100%" padding={isStandaloneChat ? '0 12px' : 0}>
          <SelectedShips ships={selectedIdentity} onRemove={onShipRemove} />
        </Flex>
      )}
      <Flex
        width="100%"
        height="100%"
        padding={isStandaloneChat ? '0 12px' : 0}
      >
        <ShipSearch
          search={searchString}
          selected={selectedIdentity}
          onSelected={(contact: any) => onShipSelected(contact)}
        />
      </Flex>
    </Flex>
  );
};

export const CreateNewChat = observer(CreateNewChatPresenter);
