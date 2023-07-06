import { useEffect, useMemo, useRef, useState } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react-lite';
import { isValidPatp } from 'urbit-ob';

import {
  Box,
  Flex,
  Icon,
  InlineEdit,
  NoScrollBar,
  SectionDivider,
  Select,
  Text,
  TextInput,
  Toggle,
} from '@holium/design-system';

import { FileUploadParams } from 'os/services/ship/ship.service';
import { ShipSearch } from 'renderer/components/ShipSearch';
import { useFileUpload } from 'renderer/lib/useFileUpload';
import { useStorage } from 'renderer/lib/useStorage';
import { useAppState } from 'renderer/stores/app.store';
import { ShipIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  InvitePermissionType,
  PeerModelType,
} from '../../../../stores/models/chat.model';
import { ChatAvatar } from '../../components/ChatAvatar';
import { ChatLogHeader } from '../../components/ChatLogHeader';
import { ExpiresValue, millisecondsToExpires } from '../../types';
import { PeerRow } from './PeerRow';

export const createPeopleForm = (
  defaults: any = {
    person: '',
  }
) => {
  const peopleForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const person = createField({
    id: 'person',
    form: peopleForm,
    initialValue: defaults.person || '',
    validate: (patp: string) => {
      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }
      return { error: 'Invalid patp', parsed: undefined };
    },
  });

  return {
    peopleForm,
    person,
  };
};

type Props = {
  isStandaloneChat?: boolean;
};

export const ChatInfoPresenter = ({ isStandaloneChat }: Props) => {
  const storage = useStorage();
  const { loggedInAccount, theme } = useAppState();
  const { chatStore, spacesStore, friends } = useShipStore();
  const { selectedChat, setSubroute, getChatHeader } = chatStore;
  const containerRef = useRef<HTMLDivElement>(null);
  const [_isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [image, setImage] = useState(selectedChat?.metadata?.image || '');
  const { person } = useMemo(() => createPeopleForm(), []);
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());

  const isDMType = selectedChat?.type === 'dm';

  // TODO consolidate this
  const { title, subtitle, sigil, avatarColor, spaceTitle } = useMemo(() => {
    if (!selectedChat || !loggedInAccount)
      return { resolvedTitle: 'Error loading title', subtitle: '' };

    const { title, sigil, image: chatImage } = getChatHeader(selectedChat.path);
    let subtitle = '';
    if (selectedChat.type === 'dm') {
      if (chatImage) setImage(chatImage);
      if (sigil.nickname) {
        subtitle = sigil.patp;
      }
    }
    let avatarColor: string | undefined;
    let spaceTitle: string | undefined;
    if (selectedChat.type === 'space') {
      const space = spacesStore.getSpaceByChatPath(selectedChat.path);
      if (space) {
        spaceTitle = space.name;
        subtitle = spaceTitle;
        avatarColor = space.color;
        if (space.picture) setImage(space.picture);
      }
    }
    return { title, subtitle, sigil, spaceTitle, avatarColor };
  }, [selectedChat?.path, loggedInAccount]);

  const [editTitle, setEditTitle] = useState(title || 'Error loading title');

  useEffect(() => {
    if (!selectedChat || !loggedInAccount) return;
    selectedChat.fetchPeers(loggedInAccount.serverId);
  }, [selectedChat]);

  const { canUpload, promptUpload } = useFileUpload({ storage });

  if (!selectedChat) return null;

  const {
    sortedPeers,
    type,
    metadata,
    path,
    peersGetBacklog,
    invites,
    expiresDuration,
    updatePeersGetBacklog,
    updateInvitePermissions,
    updateExpiresDuration,
  } = selectedChat;

  const editMetadata = (editedMetadata: any) => {
    if (!selectedChat) return;
    selectedChat.updateMetadata(editedMetadata);
  };

  const uploadFile = (params: FileUploadParams) => {
    setIsUploading(true);
    setUploadError('');
    (ShipIPC.uploadFile(params) as Promise<any>)
      .then((data: { Location: string; key: string }) => {
        const url = data.Location;
        setImage(url);
        editMetadata({ image: url });
      })
      .catch(() => {
        setUploadError('Failed upload, please try again.');
      })
      .finally(() => setIsUploading(false));
  };

  const amHost =
    sortedPeers.find((peer) => peer.ship === loggedInAccount?.serverId)
      ?.role === 'host';
  const isSpaceChat = type === 'space';

  const patps = sortedPeers.map((peer) => peer.ship);

  const chatAvatarEl = (
    <ChatAvatar
      sigil={sigil}
      type={type}
      path={path}
      peers={patps}
      size={48}
      image={image}
      metadata={metadata}
      color={avatarColor}
      canEdit={amHost && canUpload}
      onUpload={() => {
        if (!containerRef.current) return;
        promptUpload(containerRef.current)
          .then((file: File) => {
            const params: FileUploadParams = {
              source: 'file',
              content: file.path,
              contentType: file.type,
            };
            uploadFile(params);
          })
          .catch((e) => console.error(e));
      }}
    />
  );

  const onShipSelected = (contact: [string, string?]) => {
    const patp = contact[0];
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    selectedChat
      .addPeer(patp)
      .then(() => {
        console.log('adding peer', patp);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <Flex flexDirection="column" width="100%" height="100%">
      <ChatLogHeader
        path={path}
        isMuted={selectedChat.muted}
        hasMenu={false}
        forceBackButton
        isStandaloneChat={isStandaloneChat}
        onBack={() => setSubroute('chat')}
      />
      <NoScrollBar
        flex={1}
        flexDirection="column"
        overflowY="auto"
        padding={isStandaloneChat ? '12px' : '0 0 12px 0'}
      >
        <Flex flexDirection="column" gap={4} pt={3} pb={3}>
          <Flex
            flexDirection="column"
            justifyContent="center"
            gap={4}
            alignItems="center"
            pointerEvents={isDMType || isSpaceChat || !amHost ? 'none' : 'auto'}
          >
            <div ref={containerRef} style={{ display: 'none' }}></div>
            {chatAvatarEl}
            {uploadError && (
              <Text.Custom color="intent-alert" fontSize={1}>
                {uploadError}
              </Text.Custom>
            )}
            <Flex
              flexDirection="column"
              gap={4}
              pointerEvents={isDMType || !amHost ? 'none' : 'auto'}
            >
              <InlineEdit
                id="chat-title"
                name="chat-title"
                fontWeight={500}
                fontSize="1.125rem" // in rem units (base 16px) so 1.125rem
                textAlign="center"
                width={350}
                value={editTitle}
                editable={amHost}
                onBlur={() => {
                  if (editTitle.length > 1) {
                    editMetadata({ title: editTitle });
                  }
                }}
                onChange={(evt: any) => {
                  setEditTitle(evt.target.value);
                }}
              />
              {subtitle && (
                <Text.Custom textAlign="center" fontSize={2} opacity={0.5}>
                  {subtitle}
                </Text.Custom>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex my={2} flexDirection="column">
          <Box mb={2}>
            <SectionDivider label="Settings" alignment="left" />
          </Box>
          <Flex flexDirection="column">
            <Flex
              width="100%"
              px={2}
              py={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex alignItems="center">
                <Icon name="ChatReactionSetting" size={24} mr={2} />
                <Text.Custom fontWeight={400} fontSize="14px">
                  Reactions
                </Text.Custom>
              </Flex>
              <Toggle
                disabled={!isDMType && !amHost}
                initialChecked={metadata?.reactions}
                onChange={(isChecked) => {
                  editMetadata({ reactions: isChecked });
                }}
              />
            </Flex>
            {!isDMType && (
              <>
                <Flex
                  width="100%"
                  px={2}
                  py={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Flex alignItems="center">
                    <Icon name="ChatHistorySetting" size={24} mr={2} />
                    <Text.Custom
                      alignItems="center"
                      fontWeight={400}
                      fontSize="14px"
                    >
                      Chat history for new members
                    </Text.Custom>
                  </Flex>
                  <Toggle
                    disabled={!amHost}
                    initialChecked={peersGetBacklog}
                    onChange={(isChecked) => {
                      updatePeersGetBacklog(isChecked);
                    }}
                  />
                </Flex>
                {!isSpaceChat && (
                  <Flex
                    width="100%"
                    px={2}
                    pt={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Flex alignItems="center">
                      <Icon name="ChatInvitePermission" size={24} mr={2} />
                      <Text.Custom
                        alignItems="center"
                        fontWeight={400}
                        fontSize="14px"
                      >
                        Invites
                      </Text.Custom>
                    </Flex>
                    <Select
                      disabled={!amHost}
                      id="select-invite-permission"
                      width={120}
                      options={[
                        { label: 'Host only', value: 'host' },
                        { label: 'Anyone', value: 'anyone' },
                      ]}
                      selected={invites}
                      onClick={(value) => {
                        updateInvitePermissions(value as InvitePermissionType);
                      }}
                    />
                  </Flex>
                )}
              </>
            )}

            <Flex
              width="100%"
              px={2}
              {...(isDMType ? { pt: 1 } : { py: 2 })}
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex alignItems="center">
                <Icon name="ChatDisappearingMessages" size={24} mr={2} />
                <Text.Custom
                  alignItems="center"
                  fontWeight={400}
                  fontSize="14px"
                >
                  Disappearing messages
                </Text.Custom>
              </Flex>
              <Select
                disabled={!isDMType && !amHost}
                id="select-disappearing-duration"
                width={120}
                options={[
                  { label: 'Off', value: 'off' },
                  { label: '1 month', value: '1-month' },
                  { label: '1 week', value: '1-week' },
                  { label: '1 day', value: '1-day' },
                  { label: '12 hours', value: '12-hours' },
                  { label: '1 hour', value: '1-hour' },
                  { label: '10 minutes', value: '10-mins' },
                ]}
                selected={
                  expiresDuration
                    ? millisecondsToExpires(expiresDuration)
                    : 'off'
                }
                onClick={(value) => {
                  updateExpiresDuration(value as ExpiresValue);
                }}
              />
            </Flex>
          </Flex>
        </Flex>
        {/* Members */}
        <Flex my={2} flexDirection="column">
          <Box mb={1}>
            <SectionDivider
              label={`${sortedPeers.length} members`}
              alignment="left"
            />
          </Box>
          {!isDMType && (
            <>
              <Flex flexDirection="column" position="relative" width="100%">
                {!isSpaceChat ? (
                  <Flex py={1} width="100%">
                    <TextInput
                      id="new-chat-patp-search"
                      name="new-chat-patp-search"
                      tabIndex={1}
                      width="100%"
                      placeholder="Add someone?"
                      // TODO disable if not permissioned
                      value={person.state.value}
                      height={34}
                      onKeyDown={(evt: any) => {
                        if (evt.key === 'Enter' && person.computed.parsed) {
                          onShipSelected([person.computed.parsed, '']);
                          person.actions.onChange('');
                        }
                      }}
                      onChange={(e: any) => {
                        person.actions.onChange(e.target.value);
                      }}
                      onFocus={() => {
                        person.actions.onFocus();
                      }}
                      onBlur={() => {
                        person.actions.onBlur();
                      }}
                      // onFocus={() => urbitId.actions.onFocus()}
                      // onBlur={() => urbitId.actions.onBlur()}
                      // onKeyDown={submitNewChat} TODO make enter on valid patp add to selectedPatp
                    />
                  </Flex>
                ) : (
                  <Flex
                    flexDirection="row"
                    mx={1}
                    mt={1}
                    mb={2}
                    p={2}
                    border="1px solid rgba(0, 0, 0, 0.1)"
                    background={
                      theme.mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.125)'
                        : 'rgba(0, 0, 0, 0.065)'
                    }
                    borderRadius={6}
                  >
                    <Icon name="InfoCircle" color="icon" mr={2} opacity={0.7} />
                    <Text.Hint lineHeight={1.25} opacity={0.7}>
                      Currently all members of{' '}
                      <span style={{ fontWeight: 500 }}>{spaceTitle}</span> are
                      in this chat. In the future, you will be able to create
                      channels and invite a subset of members or allow certain
                      roles to gain access.
                    </Text.Hint>
                  </Flex>
                )}
                <Flex px={2}>
                  <ShipSearch
                    isDropdown
                    search={person.state.value}
                    selected={selectedPatp}
                    onSelected={(contact: any) => {
                      onShipSelected(contact);
                      person.actions.onChange('');
                    }}
                  />
                </Flex>
              </Flex>
            </>
          )}
          {sortedPeers.map((peer: PeerModelType) => {
            const id = `${path}-peer-${peer.ship}`;
            const options = [];
            if (peer.ship !== loggedInAccount?.serverId) {
              // TODO check if peer is friend
              options.push({
                id: `${id}-add-friend`,
                label: 'Add as friend',
                onClick: (evt: any) => {
                  evt.stopPropagation();
                  friends.addFriend(peer.ship);
                },
              });
            }
            if (peer.role !== 'host' && amHost && !isSpaceChat) {
              options.push({
                id: `${id}-remove`,
                label: 'Remove',
                onClick: (evt: any) => {
                  evt.stopPropagation();
                  selectedChat
                    .removePeer(peer.ship)
                    .then(() => {
                      console.log('removed peer');
                    })
                    .catch((e) => {
                      console.error(e);
                    });
                },
              });
            }
            return (
              <PeerRow
                key={id}
                id={id}
                peer={peer.ship}
                role={peer.role}
                options={options}
              />
            );
          })}
        </Flex>
      </NoScrollBar>
    </Flex>
  );
};

export const ChatInfo = observer(ChatInfoPresenter);
