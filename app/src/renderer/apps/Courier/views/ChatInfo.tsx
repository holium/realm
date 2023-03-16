import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flex,
  Text,
  Box,
  SectionDivider,
  Row,
  Avatar,
  MenuItemProps,
  Toggle,
  Select,
  Icon,
  TextInput,
} from '@holium/design-system';
// import { toJS } from 'mobx';
import { useServices } from 'renderer/logic/store';
import { InlineEdit, ShipSearch, useContextMenu } from 'renderer/components';
import { isValidPatp } from 'urbit-ob';
import { createField, createForm } from 'mobx-easy-form';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { useChatStore } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { ChatAvatar } from '../components/ChatAvatar';

import { FileUploadParams } from 'os/services/ship/models/ship';
import { useFileUpload } from 'renderer/logic/lib/useFileUpload';
import { ShipActions } from 'renderer/logic/actions/ship';
import { IuseStorage } from 'renderer/logic/lib/useStorage';
import { observer } from 'mobx-react-lite';
import { InvitePermissionType, PeerModelType } from '../models';
import { ExpiresValue, millisecondsToExpires } from '../types';

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

type ChatInfoProps = {
  storage: IuseStorage;
};

export const ChatInfoPresenter = ({ storage }: ChatInfoProps) => {
  const { selectedChat, setSubroute, getChatTitle } = useChatStore();
  const { friends, ship } = useServices();
  const containerRef = useRef<HTMLDivElement>(null);
  const [_isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [image, setImage] = useState(selectedChat?.metadata?.image || '');
  const { person } = useMemo(() => createPeopleForm(), []);
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());

  const resolvedTitle = useMemo(() => {
    if (!selectedChat || !ship) return 'Error loading title';
    return getChatTitle(selectedChat.path, ship.patp);
  }, [selectedChat?.path, ship]);

  const contactMetadata =
    selectedChat?.type === 'dm' && resolvedTitle
      ? friends.getContactAvatarMetadata(resolvedTitle)
      : {
          patp: resolvedTitle,
          color: '#000',
          nickname: '',
          avatar: '',
        };

  const [editTitle, setEditTitle] = useState(
    resolvedTitle ||
      contactMetadata.nickname ||
      contactMetadata.patp ||
      'Error loading title'
  );

  useEffect(() => {
    if (!selectedChat || !ship) return;
    selectedChat.fetchPeers(ship.patp);
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
  // const title = metadata?.title;

  const editMetadata = (editedMetadata: any) => {
    if (!selectedChat) return;
    selectedChat.updateMetadata(editedMetadata);
  };

  // const setInvote

  const uploadFile = (params: FileUploadParams) => {
    setIsUploading(true);
    setUploadError('');
    ShipActions.uploadFile(params)
      .then((url: string) => {
        setImage(url);
        editMetadata({ image: url });
      })
      .catch(() => {
        setUploadError('Failed upload, please try again.');
      })
      .finally(() => setIsUploading(false));
  };

  const amHost =
    sortedPeers.find((peer) => peer.ship === ship!.patp)?.role === 'host';

  const patps = sortedPeers.map((peer) => peer.ship);

  const chatAvatarEl = (
    <ChatAvatar
      title={resolvedTitle}
      type={type}
      path={path}
      peers={patps}
      size={48}
      image={image}
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
    ChatDBActions.addPeer(path, patp)
      .then(() => {
        console.log('adding peer', patp);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <Flex flexDirection="column">
      <ChatLogHeader
        path={path}
        title={'Chat Info'}
        avatar={<div />}
        onBack={() => setSubroute('chat')}
        hasMenu={false}
      />
      {/* Chat Info */}
      <Flex flexDirection="column" gap={4} pt={3} pb={4}>
        <Flex
          flexDirection="column"
          justifyContent="center"
          gap={4}
          alignItems="center"
        >
          <div ref={containerRef} style={{ display: 'none' }}></div>
          {chatAvatarEl}
          {uploadError && (
            <Text.Custom color="intent-alert" fontSize={1}>
              {uploadError}
            </Text.Custom>
          )}
          <Flex flexDirection="column">
            <InlineEdit
              fontWeight={500}
              fontSize={3}
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
            {/* <InlineEdit
              fontSize={2}
              textAlign="center"
              width={350}
              placeholder="Add a description"
              value={description}
              onChange={(evt: any) => {
                setDescription(evt.target.value);
              }}
            /> */}
          </Flex>
        </Flex>
      </Flex>
      {/* Settings */}
      <Flex my={2} flexDirection="column">
        <Box mb={2}>
          <SectionDivider label="Settings" alignment="left" />
        </Box>
        <Flex flexDirection="column">
          {/* <Flex
            width="100%"
            px={2}
            py={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Text.Custom fontWeight={400} fontSize={2}>
              Access
            </Text.Custom>
            <RadioGroup
              customBg="transparent"
              textColor="inherit"
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
              ]}
              onClick={(value) => {
                console.log(value);
              }}
            />
          </Flex> */}
        </Flex>
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
              disabled={!amHost}
              initialChecked={metadata?.reactions}
              onChange={(isChecked) => {
                editMetadata({ reactions: isChecked });
              }}
            />
          </Flex>
          <Flex
            width="100%"
            px={2}
            py={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center">
              <Icon name="ChatHistorySetting" size={24} mr={2} />
              <Text.Custom alignItems="center" fontWeight={400} fontSize="14px">
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
          <Flex
            width="100%"
            px={2}
            pt={1}
            // py={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center">
              <Icon name="ChatInvitePermission" size={24} mr={2} />
              <Text.Custom alignItems="center" fontWeight={400} fontSize="14px">
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
              onClick={(value: string) => {
                updateInvitePermissions(value as InvitePermissionType);
              }}
            />
          </Flex>

          <Flex
            width="100%"
            px={2}
            py={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center">
              <Icon name="ChatDisappearingMessages" size={24} mr={2} />
              <Text.Custom alignItems="center" fontWeight={400} fontSize="14px">
                Disappearing messages
              </Text.Custom>
            </Flex>
            <Select
              disabled={!amHost}
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
                expiresDuration ? millisecondsToExpires(expiresDuration) : 'off'
              }
              onClick={(value: string) => {
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
        <Flex py={1} width="100%" px={1}>
          <TextInput
            id="new-chat-patp-search"
            name="new-chat-patp-search"
            tabIndex={1}
            mx={2}
            width="100%"
            className="realm-cursor-text-cursor"
            placeholder="Add someone?"
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
        <Flex px={3}>
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
        {sortedPeers.map((peer: PeerModelType) => {
          const id = `${path}-peer-${peer.ship}`;
          const options = [];
          if (peer.ship !== ship?.patp) {
            // TODO check if peer is friend
            options.push({
              id: `${id}-add-friend`,
              label: 'Add as friend',
              onClick: (evt: any) => {
                evt.stopPropagation();
                console.log('adding friend', peer.ship);
              },
            });
          }
          if (peer.role !== 'host' && amHost) {
            options.push({
              id: `${id}-remove`,
              label: 'Remove',
              onClick: (evt: any) => {
                evt.stopPropagation();
                ChatDBActions.removePeer(path, peer.ship)
                  .then(() => {
                    console.log('removed peer');
                  })
                  .catch((e) => {
                    console.error(e);
                  });
              },
            });
          }
          // options.push({
          //   id: `${id}-profile`,
          //   label: 'View Profile',
          //   onClick: (_evt: any) => {
          //     console.log('view profile');
          //   },
          // });
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
    </Flex>
  );
};

type PeerRowProps = {
  id: string;
  peer: string;
  role: string;
  options?: MenuItemProps[];
};

const LabelMap = {
  host: 'owner',
  admin: 'admin',
};
const PeerRow = ({ id, peer, options, role }: PeerRowProps) => {
  const { getOptions, setOptions } = useContextMenu();

  const { friends } = useServices();

  useEffect(() => {
    if (options && options.length && options !== getOptions(id)) {
      setOptions(id, options);
    }
  }, [options, getOptions, id, setOptions]);

  const metadata = friends.getContactAvatarMetadata(peer);
  return (
    <Row id={id}>
      <Flex
        gap={10}
        flexDirection="row"
        alignItems="center"
        flex={1}
        maxWidth="100%"
        style={{ pointerEvents: 'none' }}
      >
        <Box>
          <Avatar
            simple
            size={22}
            avatar={metadata.avatar}
            patp={metadata.patp}
            sigilColor={[metadata.color || '#000000', 'white']}
          />
        </Box>
        <Flex flex={1} height="22px" overflow="hidden" alignItems="center">
          <Text.Custom
            fontSize={2}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {metadata.nickname ? metadata.nickname : metadata.patp}
          </Text.Custom>
        </Flex>
        {(role === 'host' || role === 'admin') && (
          <Text.Custom fontSize={2} opacity={0.5}>
            {LabelMap[role]}
          </Text.Custom>
        )}
      </Flex>
    </Row>
  );
};

export const ChatInfo = observer(ChatInfoPresenter);
