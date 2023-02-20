import { useState } from 'react';
import { Flex, Avatar, Text, Box, SectionDivider } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { InlineEdit, PersonRow } from 'renderer/components';
import { ChatLogHeader } from '../components/ChatLogHeader';
import { useChatStore } from '../store';

// type ChatInfoProps = {
//   path: string;
//   title: string;
//   subtitle?: string;
//   avatar: React.ReactNode;
//   onBack: () => void;
//   peers: string[];
// };

export const ChatInfo = () => {
  // const { dimensions } = useTrayApps();
  // const { friends } = useServices();
  const { selectedPath, title, setSubroute } = useChatStore();
  const { friends, ship, theme } = useServices();
  const peers = [ship!.patp, '~hosryc-matbel'];

  const metadata = title
    ? friends.getContactAvatarMetadata(title)
    : { patp: title!, color: '#000', nickname: '', avatar: '' };
  const [editTitle, setEditTitle] = useState(
    metadata.nickname || metadata.patp
  );
  const [description, setDescription] = useState('');
  if (!selectedPath || !title) return null;
  return (
    <Flex flexDirection="column">
      <ChatLogHeader
        path={selectedPath}
        title={'Info'}
        avatar={<div />}
        onBack={() => setSubroute('chat')}
        hasMenu={false}
      />
      {/* Chat Info */}
      <Flex flexDirection="column" gap={4} pt={3} pb={4}>
        <Flex
          flexDirection="column"
          justifyContent="center"
          gap={12}
          alignItems="center"
        >
          <Avatar
            patp={metadata.patp}
            avatar={metadata.avatar}
            size={48}
            sigilColor={[metadata.color, '#ffffff']}
            simple
          />
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
            <InlineEdit
              fontSize={2}
              textAlign="center"
              width={350}
              placeholder="Add a description"
              value={description}
              onChange={(evt: any) => {
                setDescription(evt.target.value);
              }}
            />
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
