import { LocalParticipant } from './lib/participant/local';
import { RemoteParticipant } from './lib/participant/remote';

export const handleLocalEvents = (
  setState: (state: { muted: boolean; cursor: boolean }) => void,
  our?: LocalParticipant
) => {
  console.log('registering local');
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
  console.log('participant, speaker', participant);
  if (!participant) return;
  setState(participant.connectionState);
  console.log('listening for remote events');
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
