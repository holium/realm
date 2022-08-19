import { Patp } from 'os/types';
import { Participant } from '.';

export type Handshake = 'awaiting-offer' | 'offer' | 'ice-candidate' | 'answer';
export class LocalParticipant extends Participant {
  isLoaded: boolean = false;
  stream?: MediaStream;
  waiting: Map<Patp, Handshake> = new Map();

  constructor(patp: Patp) {
    super(patp);
  }

  async connect() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.isLoaded = true;
  }

  setTracks(peerConn: RTCPeerConnection) {
    if (!this.isLoaded) return;
    this.stream!.getTracks().forEach((track: MediaStreamTrack) => {
      peerConn.addTrack(track, this.stream!);
    });
  }

  setWaiting(patp: Patp, callback: any) {
    this.waiting.set(patp, callback);
  }
}
