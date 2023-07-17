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
    <SpeakerGridStyle
    // flex={1}
    // flexDirection="column"
    // padding="12px"
    // position="relative"
    // width="100%"
    // minWidth={0}
    >
      <Flex flex={1}>
        <Box height="100%" width="100%">
          {renderPeer(activePeer, '100%')}
        </Box>
      </Flex>
      {peers.slice(1).length > 0 && (
        <PeersScroller>
          {peers
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
      )}
    </SpeakerGridStyle>
  );
};

const SpeakerGridStyle = styled.div`
  /* display: grid;
  width: 100%;
  padding: 2px;
  padding-bottom: 4px;
  gap: 8px; */

  /* grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(2, 1fr); */
  /* gap: 20px; adjust the gap as needed */
  /* overflow-x: auto;
  grid-template-rows: 2fr 1fr;
  grid-template-columns: 2fr 1fr; */
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
  width: 100%;
  min-width: 0;

  .active-speaker {
    /* grid-area: 1 / 1 / 2 / 3;
    width: 100%;
    height: 100%;
    transition: width 0.5s ease-in-out;
    overflow: visible; */
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

// <SpeakerGridStyle>
//   {peers.map((peerId: string) => (
//     <Box
//       key={`${peerId}-box`}
//       // width="250px"
//       // minWidth="250px"
//       // height="250px"
//     >
//       {renderPeer(peerId, '250px')}
//     </Box>
//   ))}
// </SpeakerGridStyle>
