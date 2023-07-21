import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { SpeakerGrid } from '../components/SpeakerGrid';
import { SpeakerGridStandaloneChat } from '../components/SpeakerGridStandaloneChat';
import { roomTrayConfig } from '../config';
import { useRoomsStore } from '../store/RoomsStoreContext';

type Props = {
  isStandaloneChat?: boolean;
};

const VoiceViewPresenter = ({ isStandaloneChat }: Props) => {
  const roomsStore = useRoomsStore();
  const { setTrayAppHeight } = useTrayApps();
  const { loggedInAccount } = useAppState();
  const { friends } = useShipStore();
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const ourId = useMemo(() => loggedInAccount?.serverId, [loggedInAccount]);
  const peers = useMemo(
    () => roomsStore.currentRoomPresent ?? [],
    [roomsStore.currentRoomPresent]
  );

  // Sort peers in the following priority:
  // #1: Active speaker
  // #2: Ourself
  const peersSorted = useMemo(() => {
    return peers.slice().sort((a, b) => {
      if (a === activeSpeaker) return -1;
      if (b === activeSpeaker) return 1;
      if (a === ourId) return -1;
      if (b === ourId) return 1;
      return 0;
    });
  }, [peers, activeSpeaker, ourId]);

  useEffect(() => {
    const regularHeight = roomTrayConfig.dimensions.height;
    if (peers.length >= 4) {
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

  if (isStandaloneChat) {
    return (
      <SpeakerGridStandaloneChat
        ourId={ourId ?? ''}
        activeSpeaker={activeSpeaker ?? ourId ?? peersSorted[0]}
        peers={peersSorted}
        getContactMetadata={getContactMetadata}
        getPeer={getPeer}
        room={roomsStore.currentRoom}
        kickPeer={roomsStore.kickPeer}
        retryPeer={roomsStore.retryPeer}
        pinnedSpeaker={roomsStore.pinnedSpeaker}
        onPinnedSpeaker={roomsStore.pinSpeaker}
      />
    );
  }

  return (
    <SpeakerGrid
      activeSpeaker={activeSpeaker || ourId || null}
      peers={peersSorted}
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
