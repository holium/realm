import { useEffect, useRef, useState } from 'react';
import {
  Flex,
  Text,
  Box,
  SectionDivider,
  Button,
  Row,
  Avatar,
  MenuItemProps,
} from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { InlineEdit, useContextMenu } from 'renderer/components';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { useChatStore } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { ChatAvatar } from '../components/ChatAvatar';

import { FileUploadParams } from 'os/services/ship/models/ship';
import { useFileUpload } from 'renderer/logic/lib/useFileUpload';
import { ShipActions } from 'renderer/logic/actions/ship';
import { IuseStorage } from 'renderer/logic/lib/useStorage';

type PeerType = {
  peer: string;
  role: string;
};

type ChatInfoProps = {
  storage: IuseStorage;
};
export const ChatInfo = ({ storage }: ChatInfoProps) => {
  const { selectedPath, metadata, type, updateMetadata, title, setSubroute } =
    useChatStore();
  const { friends, ship } = useServices();
  const [peers, setPeers] = useState<PeerType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [image, setImage] = useState(metadata?.image || '');

  const contactMetadata = title
    ? friends.getContactAvatarMetadata(title)
    : { patp: title!, color: '#000', nickname: '', avatar: '' };

  const [editTitle, setEditTitle] = useState(
    metadata?.title || contactMetadata.nickname || contactMetadata.patp
  );

  useEffect(() => {
    if (!selectedPath) return;
    ChatDBActions.getChatPeers(selectedPath).then((peers: PeerType[]) => {
      setPeers(peers.sort((a: PeerType) => (a.peer === ship!.patp ? -1 : 1)));
    });
  }, [selectedPath]);

  const editMetadata = (editedMetadata: any) => {
    if (!selectedPath) return;
    editedMetadata = { ...metadata, ...editedMetadata };
    ChatDBActions.editChat(selectedPath, editedMetadata);
    updateMetadata(editedMetadata);
  };

  const { canUpload, promptUpload } = useFileUpload({ storage });

  const uploadFile = (params: FileUploadParams) => {
    setIsUploading(true);
    setUploadError('');
    ShipActions.uploadFile(params)
      .then((url) => {
        setImage(url);
        editMetadata({ image: url });
      })
      .catch(() => {
        setUploadError('Failed upload, please try again.');
      })
      .finally(() => setIsUploading(false));
  };

  // const [description, setDescription] = useState('');
  const patps = peers.map((peer) => peer.peer);
  if (!selectedPath || !title) return null;
  return (
    <Flex flexDirection="column">
      <ChatLogHeader
        path={selectedPath}
        title={'Info'}
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
      <Flex flexDirection="column">
        <Box mb={100}>
          <SectionDivider label="Settings" alignment="left" />
        </Box>

        {/* <Text.Custom mt={3} mb={5} fontSize={2}>
          Settings go here
        </Text.Custom> */}
      </Flex>
      {/* Members */}
      <Flex flexDirection="column">
        <Box mb={1}>
          <SectionDivider label={`${peers.length} members`} alignment="left" />
        </Box>

        {peers.map((peer) => {
          const id = `${selectedPath}-peer-${peer.peer}`;
          const options = [];
          if (peer.role !== 'host') {
            options.push({
              id: `${id}-remove`,
              label: 'Remove',
              onClick: (_evt: any) => {
                // ShipActions.removeFriend(friend.patp);
              },
            });
          }
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
