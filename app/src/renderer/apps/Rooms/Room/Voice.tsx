import { useEffect } from 'react';
import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';

import { Flex } from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';

import { Speaker } from '../components/Speaker';
import { roomTrayConfig } from '../config';
import { useRoomsStore } from '../store/RoomsStoreContext';

const VoiceViewPresenter = () => {
  // const { roomsStore } = useShipStore();
  const roomsStore = useRoomsStore();

  const { loggedInAccount } = useAppState();
  // const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const { setTrayAppHeight } = useTrayApps();
  const peers = roomsStore.currentRoomPeers ?? [];

  useEffect(() => {
    const regularHeight = roomTrayConfig.dimensions.height;
    if (peers.length + 1 > 4) {
      const tallHeight = roomTrayConfig.dimensions.height + 181 + 12;
      setTrayAppHeight(tallHeight);
    } else {
      setTrayAppHeight(regularHeight);
    }
  }, [peers.length, setTrayAppHeight]);

  // useEffect(() => {
  //   let interval: NodeJS.Timer | null = null;
  //   const removeAllClasses = (allPeers: string[]) => {
  //     if (loggedInAccount) allPeers.push(loggedInAccount.serverId);
  //     allPeers.forEach((peer: string) => {
  //       const speakerDiv = document.getElementById(`room-speaker-${peer}`);
  //       if (speakerDiv) {
  //         speakerDiv.classList.remove('active-speaker');
  //         speakerDiv.classList.remove('other-speaker');
  //       }
  //     });
  //   };
  //   if (peers.length > 0) {
  //     interval = setInterval(() => {
  //       let dominantSpeaker: string | null = null;
  //       let maxSpeakingTime = 0;
  //       const speakers = roomsStore.speakers;

  //       // Iterate over each speaker
  //       for (const [peerId, speaker] of speakers) {
  //         // If the speaker is currently speaking, update the current session's end time
  //         if (speaker.isSpeaking && speaker.currentSession) {
  //           speaker.currentSession.end = Date.now();
  //         }

  //         // Remove sessions that ended more than 6 seconds ago
  //         while (
  //           speaker.sessions.length > 0 &&
  //           Date.now() - (speaker.sessions[0]?.end || 0) > 10000
  //         ) {
  //           speaker.sessions.shift();
  //         }

  //         // Calculate the total speaking time in the last 6 seconds
  //         const totalSpeakingTime = speaker.sessions.reduce(
  //           (total, session) => total + (session.duration || 0),
  //           0
  //         );

  //         // Update the dominant speaker if this speaker has spoken more
  //         if (totalSpeakingTime > maxSpeakingTime) {
  //           dominantSpeaker = peerId;
  //           maxSpeakingTime = totalSpeakingTime;
  //         }
  //       }

  //       if (!dominantSpeaker && activeSpeaker) {
  //         console.log('no active speaker');
  //         setActiveSpeaker(null);
  //         removeAllClasses(peers);
  //       }

  //       if (activeSpeaker !== dominantSpeaker) {
  //         console.log('active speaker changed', activeSpeaker, dominantSpeaker);

  //         setActiveSpeaker(dominantSpeaker);
  //         const speakerDiv = document.getElementById(
  //           `room-speaker-${dominantSpeaker}`
  //         );
  //         // add a class to the speaker div
  //         if (speakerDiv) {
  //           speakerDiv.classList.add('active-speaker');
  //           // iterate over the other speaker divs and add other-speaker class
  //           const otherPeers = peers.filter((peer) => peer !== dominantSpeaker);

  //           if (loggedInAccount) otherPeers.push(loggedInAccount.serverId);
  //           otherPeers.forEach((peer) => {
  //             const otherSpeakerDiv = document.getElementById(
  //               `room-speaker-${peer}`
  //             );
  //             if (otherSpeakerDiv) {
  //               otherSpeakerDiv.classList.remove('active-speaker');
  //               otherSpeakerDiv.classList.add('other-speaker');
  //             }
  //           });
  //         }
  //       }
  //     }, 1000);
  //   }
  //   peers.forEach((peer) => {
  //     const speakerDiv = document.getElementById(`room-speaker-${peer}`);
  //     if (speakerDiv && activeSpeaker) {
  //       if (
  //         !speakerDiv.classList.contains('other-speaker') &&
  //         activeSpeaker !== peer
  //       ) {
  //         speakerDiv.classList.add('other-speaker');
  //       }
  //     }
  //   });

  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [roomsStore.currentRid, activeSpeaker, peers.length]);

  if (!roomsStore.currentRid) {
    return null;
  }

  // if (activeSpeaker) {
  //   return (
  //     <SpeakerGrid peers={peers} activeSpeaker={activeSpeaker}>
  //       <div className="active-speaker">
  //         <Speaker key={activeSpeaker} type="speaker" person={activeSpeaker} />
  //       </div>
  //       <div className="others-container">
  //         {peers.map((peer: string) => {
  //           if (peer === activeSpeaker) return null;
  //           return <Speaker key={peer} type="speaker" person={peer} />;
  //         })}
  //       </div>
  //     </SpeakerGrid>
  //   );
  // }

  return (
    <SpeakerGrid peers={peers} activeSpeaker={null}>
      <Speaker
        key={loggedInAccount?.serverId}
        type="our"
        person={loggedInAccount?.serverId ?? ''}
      />
      {peers.map((peer: string) => {
        return <Speaker key={peer} type="speaker" person={peer} />;
      })}
    </SpeakerGrid>
  );
};

export const VoiceView = observer(VoiceViewPresenter);

type SpeakerGridProps = {
  peers: string[];
  activeSpeaker: string | null;
};

const SpeakerGrid = styled(Flex)<SpeakerGridProps>`
  display: grid;
  flex: 2;
  gap: 12px;
  padding: 4px 2px;
  scrollbar-width: thin;

  ${({ activeSpeaker, peers }: SpeakerGridProps) =>
    activeSpeaker
      ? css`
          grid-template-columns: 1fr;
          grid-template-rows: 70% 30%;
          grid-template-areas:
            'active'
            'others';
        `
      : css`
          ${peers.length + 1
            ? css`
                grid-template-columns: repeat(2, 1fr);
              `
            : css`
                grid-template-columns: 0.5fr;
              `}
          ${peers.length > 4
            ? css`
                grid-template-rows: repeat(3, 1fr);
              `
            : css`
                grid-template-rows: repeat(2, 1fr);
              `}
      ${peers.length > 5
            ? css`
                overflow-y: scroll;
                max-height: 593px;
                margin-right: -8px;
              `
            : css`
                overflow-y: visible;
                max-height: 100%;
                margin-right: 0px;
              `}
        `}

  .active-speaker {
    grid-area: active;
    height: 100% !important;
  }

  // TODO in progress
  .others-container {
    grid-area: others;
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: auto; // Scroll if there are more than 4 speakers
  }

  .other-speaker {
    width: 120px;
    height: 100%;
  }
`;
// flex={2}
// gap={12}
// style={{
//   display: 'grid',
//   padding: '4px 2px',
//   gridTemplateColumns: peers.length + 1 ? `repeat(2, 1fr)` : '.5fr',
//   gridTemplateRows:
//     peers.length > 4 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
//   overflowY: peers.length > 5 ? 'scroll' : 'visible',
//   maxHeight: peers.length > 5 ? 593 : '100%',
//   scrollbarWidth: 'thin',
//   marginRight: peers.length > 5 ? '-8px' : '0px',
// }}
