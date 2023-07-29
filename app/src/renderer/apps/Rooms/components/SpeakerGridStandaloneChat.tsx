import styled from 'styled-components';

import { Box, Flex } from '@holium/design-system/general';

import { Speaker } from './DynamicSpeaker';
import { RoomType } from './rooms.stories';

const PeersScroller = styled(Flex)`
  gap: 8px;
  overflow-x: auto;
  height: 250px;
  width: 100%;
  min-width: 0;
  margin-top: 8px;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
`;

type Props = {
  ourId: string;
  peers: string[];
  activeSpeaker: string;
  room: RoomType;
  getPeer: (peerId: string) => any;
  getContactMetadata: (peerId: string) => any;
  kickPeer: (peerId: string) => void;
  retryPeer: (peerId: string) => void;
};

// Active speaker takes up full width,
// rest of peers are in a horizontal list below.
export const SpeakerGridStandaloneChat = ({
  ourId,
  activeSpeaker,
  peers,
  room,
  getContactMetadata,
  getPeer,
  retryPeer,
  kickPeer,
}: Props) => {
  const renderPeer = (peerId: string, height: string) => {
    const metadata = getContactMetadata(peerId);
    const peerObj = getPeer(peerId);
    const isOur = peerId === ourId;
    return (
      <Speaker
        key={peerId}
        person={peerId}
        isActive={activeSpeaker ? activeSpeaker === peerId : false}
        room={room}
        type={room.creator === peerId ? 'creator' : 'speaker'}
        height={height}
        isOur={isOur}
        ourId={ourId}
        metadata={metadata}
        peer={peerObj}
        kickPeer={kickPeer}
        retryPeer={retryPeer}
      />
    );
  };

  return (
    <Flex
      flex={1}
      flexDirection="column"
      padding="12px"
      position="relative"
      width="100%"
      minWidth={0}
    >
      <Flex flex={1}>
        <Box height="100%" width="100%">
          {renderPeer(peers[0], '100%')}
        </Box>
      </Flex>
      {peers.slice(1).length > 0 && (
        <PeersScroller>
          {peers.slice(1).map((peerId: string) => (
            <Box
              key={`${peerId}-box`}
              width="250px"
              minWidth="250px"
              height="250px"
            >
              {renderPeer(peerId, '250px')}
            </Box>
          ))}
        </PeersScroller>
      )}
    </Flex>
  );
};
