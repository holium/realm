import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { SpeakerGrid } from '../components/SpeakerGrid';
import { roomTrayConfig } from '../config';
import { useRoomsStore } from '../store/RoomsStoreContext';

const VoiceViewPresenter = () => {
  const roomsStore = useRoomsStore();

  const { loggedInAccount } = useAppState();
  const { friends } = useShipStore();
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const { setTrayAppHeight } = useTrayApps();
  const peers = roomsStore.currentRoomPresent ?? [];

  useEffect(() => {
    const regularHeight = roomTrayConfig.dimensions.height;
    if (peers.length > 4) {
      const tallHeight = roomTrayConfig.dimensions.height + 212;
      setTrayAppHeight(tallHeight);
    } else {
      setTrayAppHeight(regularHeight);
    }
  }, [peers.length, setTrayAppHeight]);

  useEffect(() => {
    let interval: NodeJS.Timer | null = null;

    if (peers.length > 0) {
      interval = setInterval(() => {
        let dominantSpeaker: string | null = null;
        let maxSpeakingTime = 0;
        const speakers = roomsStore.speakers;

        // Iterate over each speaker
        for (const [peerId, speaker] of speakers) {
          // If the speaker is currently speaking, update the current session's end time
          if (!speaker.isSpeaking && speaker.currentSession) {
            if (speaker.currentSession.start) {
              speaker.currentSession.end = Date.now();
            }
          }
          // Remove sessions that ended more than 10 seconds ago
          while (
            speaker.sessions.length > 0 &&
            Date.now() - (speaker.sessions[0]?.end || 0) > 10000
          ) {
            speaker.sessions.shift();
          }
          // Calculate the total speaking time in the last 10 seconds
          const totalSpeakingTime = speaker.sessions.reduce(
            (total, session) => total + (session.duration || 0),
            0
          );
          // Update the dominant speaker if this speaker has spoken more
          if (totalSpeakingTime > maxSpeakingTime) {
            dominantSpeaker = peerId;
            maxSpeakingTime = totalSpeakingTime;
          }
        }
        if (!dominantSpeaker && activeSpeaker) {
          setActiveSpeaker(null);
        }
        if (activeSpeaker !== dominantSpeaker) {
          setActiveSpeaker(dominantSpeaker);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [roomsStore.currentRid, activeSpeaker, peers.length]);

  if (!roomsStore.currentRid || !roomsStore.currentRoom) {
    return null;
  }

  const getPeer = (peerId: string) => {
    if (peerId === loggedInAccount?.serverId) {
      return roomsStore.ourPeer;
    }
    return roomsStore.peers.get(peerId);
  };

  const getContactMetadata = (peerId: string) => {
    return friends.getContactAvatarMetadata(peerId);
  };

  const ourId = loggedInAccount?.serverId;

  return (
    <SpeakerGrid
      activeSpeaker={activeSpeaker || ourId || null}
      peers={peers.slice().sort((a, b) => {
        if (a === ourId) {
          return -1;
        }
        if (b === ourId) {
          return 1;
        }
        return 0;
      })}
      getContactMetadata={getContactMetadata}
      getPeer={getPeer}
      ourId={ourId ?? ''}
      room={roomsStore.currentRoom}
      kickPeer={roomsStore.kickPeer}
      retryPeer={roomsStore.retryPeer}
    />
  );
};

export const VoiceView = observer(VoiceViewPresenter);
