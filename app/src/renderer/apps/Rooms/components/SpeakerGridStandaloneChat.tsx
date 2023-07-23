import styled from 'styled-components';

import { Box, Flex } from '@holium/design-system/general';

import { Speaker } from './DynamicSpeaker';
import { RoomType } from './rooms.stories';

type Props = {
  ourId: string;
  peers: string[];
  activeSpeaker: string;
  pinnedSpeaker: string | null;
  room: RoomType;
  getPeer: (peerId: string) => any;
  getContactMetadata: (peerId: string) => any;
  kickPeer: (peerId: string) => void;
  retryPeer: (peerId: string) => void;
  onPinnedSpeaker?: (peerId: string) => void;
};

// Active speaker takes up full width,
// rest of peers are in a horizontal list below.
export const SpeakerGridStandaloneChat = ({
  ourId,
  activeSpeaker,
  pinnedSpeaker,
  peers,
  room,
  getContactMetadata,
  getPeer,
  retryPeer,
  kickPeer,
  onPinnedSpeaker,
}: Props) => {
  const renderPeer = (peerId: string, height: string) => {
    const metadata = getContactMetadata(peerId);
    const peerObj = getPeer(peerId);
    const isOur = peerId === ourId;
    return (
      <Speaker
        key={peerId}
        person={peerId}
        canPin
        isActive={
          pinnedSpeaker
            ? pinnedSpeaker === peerId
            : activeSpeaker
            ? activeSpeaker === peerId
            : false
        }
        room={room}
        type={room.creator === peerId ? 'creator' : 'speaker'}
        height={height}
        isOur={isOur}
        ourId={ourId}
        metadata={metadata}
        peer={peerObj}
        kickPeer={kickPeer}
        retryPeer={retryPeer}
        isPinned={pinnedSpeaker === peerId}
        onPin={() => onPinnedSpeaker && onPinnedSpeaker(peerId)}
      />
    );
  };
  const activePeer = pinnedSpeaker || peers[0];

  return (
    <SpeakerGridStyle>
      <Box
        position="relative"
        initial={{ height: 'calc(100% - 250px)' }}
        animate={{
          height: pinnedSpeaker ? '100%' : 'calc(100% - 250px)',
        }}
      >
        {renderPeer(activePeer, '100%')}
      </Box>
      <PeersScroller
        position="absolute"
        initial={{ opacity: 1, bottom: 0 }}
        animate={{
          opacity: pinnedSpeaker ? 0 : 1,
          bottom: pinnedSpeaker ? -500 : 0,
        }}
        transition={{ opacity: { delay: pinnedSpeaker ? 0.5 : 0 } }}
        exit={{ opacity: 0 }}
      >
        {peers.slice(1).length > 0 &&
          peers
            .filter((peerId) => activePeer !== peerId)
            .map((peerId: string) => (
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
    </SpeakerGridStyle>
  );
};

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

const SpeakerGridStyle = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
  width: 100%;
  min-width: 0;

  .active-speaker {
    flex: 2 1 60%; /* grow, shrink, basis */
  }

  .grid-item {
    /* Any styles for your individual grid items here. */
    border: 1px solid black; /* for visualization purposes */
    padding: 20px; /* adjust padding as needed */
    min-width: 100px; /* adjust width as needed */
  }

  .grid-item:nth-child(n + 5) {
    grid-column: 3 / span 1;
  }
`;
