import { useEffect, useState } from 'react';
import { Flex, Text, Box, SectionDivider, Button } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { InlineEdit, PersonRow } from 'renderer/components';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { useChatStore } from '../store';
import { ChatDBActions } from 'renderer/logic/actions/chat-db';
import { ChatAvatar } from '../components/ChatAvatar';

export const ChatInfo = () => {
  const { selectedPath, metadata, type, updateMetadata, title, setSubroute } =
    useChatStore();
  const { friends, ship, theme } = useServices();
  const [peers, setPeers] = useState<string[]>([]);
  const [image, setImage] = useState(metadata?.image || '');

  const contactMetadata = title
    ? friends.getContactAvatarMetadata(title)
    : { patp: title!, color: '#000', nickname: '', avatar: '' };

  const [editTitle, setEditTitle] = useState(
    metadata?.title || contactMetadata.nickname || contactMetadata.patp
  );

  useEffect(() => {
    if (!selectedPath) return;
    ChatDBActions.getChatPeers(selectedPath).then((peers) => {
      setPeers(peers.sort((a: string) => (a === ship!.patp ? -1 : 1)));
    });
  }, [selectedPath]);

  const editMetadata = (editedMetadata: any) => {
    if (!selectedPath) return;
    editedMetadata = { ...metadata, ...editedMetadata };
    ChatDBActions.editChat(selectedPath, editedMetadata);
    updateMetadata(editedMetadata);
  };

  // const [description, setDescription] = useState('');
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
          gap={12}
          alignItems="center"
        >
          {title && type && selectedPath && peers && (
            <ChatAvatar
              title={title}
              type={type}
              path={selectedPath}
              peers={peers}
              size={40}
              canEdit
            />
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
        <Box mb={1}>
          <SectionDivider label="Settings" alignment="left" />
        </Box>
        <Text.Custom mt={3} mb={5} fontSize={2}>
          Settings go here
        </Text.Custom>
        {/* <Text.Custom></Text.Custom> */}
      </Flex>
      {/* Members */}
      <Flex flexDirection="column">
        <Box mb={1}>
          <SectionDivider label={`${peers.length} members`} alignment="left" />
        </Box>

        {peers.map((peer) => {
          const metadata = friends.getContactAvatarMetadata(peer);
          return (
            <PersonRow
              key={metadata.patp}
              patp={metadata.patp}
              nickname={metadata.nickname}
              sigilColor={metadata.color}
              avatar={metadata.avatar}
              description={metadata.bio}
              rowBg={theme.currentTheme.windowColor}
              listId={`${selectedPath}-peer-${metadata.patp}`}
              contextMenuOptions={[
                {
                  label: 'Remove',
                  onClick: (_evt: any) => {
                    // ShipActions.removeFriend(friend.patp);
                  },
                },
              ]}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};
