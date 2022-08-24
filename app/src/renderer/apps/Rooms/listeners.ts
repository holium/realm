import { LocalParticipant, RemoteParticipant } from '@holium/realm-room';

export const handleLocalEvents = (
  setState: (state: { muted: boolean; cursor: boolean }) => void,
  our?: LocalParticipant
) => {
  our?.on('muteToggled', (isMuted: boolean) => {
    console.log('mutedToggled', isMuted);
    setState({ muted: isMuted, cursor: our.isCursorSharing });
  });
  our?.on('cursorToggled', (isCursorSharing: boolean) => {
    console.log('cursorToggled', isCursorSharing);
    setState({ muted: our.isMuted, cursor: isCursorSharing });
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
