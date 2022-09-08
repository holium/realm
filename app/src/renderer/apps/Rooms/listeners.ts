import { LocalParticipant, RemoteParticipant } from '@holium/realm-room';

export const handleLocalEvents = (
  setMuted: (muted: boolean) => void,
  setCursors: (cursor: boolean) => void,
  our?: LocalParticipant
) => {
  // our?.on('muteToggled', (isMuted: boolean) => {
  //   console.log('mutedToggled', isMuted);
  //   setMuted(isMuted);
  // });
  our?.on('cursorToggled', (isCursorSharing: boolean) => {
    console.log('cursorToggled', isCursorSharing);
    setCursors(isCursorSharing);
  });
};

export const handleRemoteEvents = (
  setState: (state: RTCPeerConnectionState) => void,
  participant?: RemoteParticipant
) => {
  if (!participant) return;
  setState(participant.connectionState);
  participant.on('connected', () => {
    setState('connected');
  });
  participant.on('disconnected', () => {
    setState('disconnected');
  });
  participant.on('connecting', () => {
    setState('connecting');
  });
  participant.on('failed', () => {
    setState('failed');
  });
};

export const handleRemoteUpdate = (
  setState: (state: { muted: boolean; cursor: boolean }) => void,
  peer?: RemoteParticipant
) => {
  if (!peer) return;
  console.log(peer);
  peer.on('trackMuted', (track: any) => {
    console.log('track muted');
    setState({ muted: true, cursor: peer.isCursorSharing });
  });
  peer.on('trackUnmuted', (track: any) => {
    setState({ muted: false, cursor: peer.isCursorSharing });
  });
};
