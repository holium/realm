import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flex,
  Text,
  Box,
  SectionDivider,
  Button,
  Row,
  Avatar,
  MenuItemProps,
  Toggle,
  Select,
  Icon,
  TextInput,
} from '@holium/design-system';
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

type PeerType = {
  peer: string;
  role: string;
};

type ChatInfoProps = {
  storage: IuseStorage;
};

export const ChatInfoPresenter = ({ storage }: ChatInfoProps) => {
  const {
    selectedPath,
    title,
    metadata,
    type,
    peersGetBacklog,
    updateMetadata,
    updatePeersGetBacklog,
    setSubroute,
  } = useChatStore();
  const { friends, ship } = useServices();
  const [peers, setPeers] = useState<PeerType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [image, setImage] = useState(metadata?.image || '');
  const { person } = useMemo(() => createPeopleForm(), []);
  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());

  const contactMetadata = title
    ? friends.getContactAvatarMetadata(title)
    : { patp: title!, color: '#000', nickname: '', avatar: '' };

  const [editTitle, setEditTitle] = useState(
    metadata?.title || contactMetadata.nickname || contactMetadata.patp
  );

  const [disappearDuration, setDisappearDuration] = useState('off');

  useEffect(() => {
    if (!selectedPath) return;
    ChatDBActions.getChatPeers(selectedPath).then((peers: PeerType[]) => {
      setPeers(
        peers.sort((a: PeerType) =>
          a.role === 'host' ? -1 : a.peer === ship!.patp ? -1 : 1
        )
      );
    });
  }, [selectedPath]);

  const editMetadata = (editedMetadata: any) => {
    if (!selectedPath) return;
    editedMetadata = { ...metadata, ...editedMetadata };
    updateMetadata(editedMetadata);
  };

  const { canUpload, promptUpload } = useFileUpload({ storage });

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
    peers.find((peer) => peer.peer === ship!.patp)?.role === 'host';

  const patps = peers.map((peer) => peer.peer);
  const onShipSelected = (contact: [string, string?]) => {
    const patp = contact[0];
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
  };
  if (!selectedPath || !title) return null;
  return (
    <Flex flexDirection="column">
      <ChatLogHeader
        path={selectedPath}
        title={'Chat Info'}
        avatar={<div />}
        onBack={() => setSubroute('chat')}
        hasMenu={false}
        rightAction={
          <Button.Minimal
            py={1}
            disabled={
              editTitle.length < 1 ||
              (editTitle === metadata?.title && image === metadata?.image)
            }
            id="save-chat-metadata"
            onClick={() => {
              editMetadata({ title: editTitle });
            }}
          >
            Save
          </Button.Minimal>
        }
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

          {title && type && selectedPath && peers && (
            <ChatAvatar
              title={title}
              type={type}
              path={selectedPath}
              peers={patps}
              size={48}
              image={image}
              canEdit={canUpload}
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
          )}
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
                { label: '4 weeks', value: '4-week' },
                { label: '1 week', value: '1-week' },
                { label: '1 day', value: '1-day' },
                { label: '12 hours', value: '12-hours' },
                { label: '1 hour', value: '1-hour' },
                { label: '10 minutes', value: '10-mins' },
              ]}
              selected={disappearDuration}
              onClick={(value: string) => {
                setDisappearDuration(value);
              }}
            />
          </Flex>
        </Flex>
      </Flex>
      {/* Members */}
      <Flex my={2} flexDirection="column">
        <Box mb={1}>
          <SectionDivider label={`${peers.length} members`} alignment="left" />
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
        {peers.map((peer) => {
          const id = `${selectedPath}-peer-${peer.peer}`;
          const options = [];
          if (peer.peer !== ship?.patp) {
            // TODO check if peer is friend
            options.push({
              id: `${id}-add-friend`,
              label: 'Add as friend',
              onClick: (_evt: any) => {
                // TODO - add as friend
                console.log('adding friend', peer.peer);
              },
            });
          }
          if (peer.role !== 'host' && amHost) {
            options.push({
              id: `${id}-remove`,
              label: 'Remove',
              onClick: (_evt: any) => {
                ChatDBActions.removePeer(selectedPath, peer.peer)
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
              peer={peer.peer}
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
