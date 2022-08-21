import { Participant } from './../participant/index';
import { toJS } from 'mobx';
import { RoomsModelType } from 'os/services/tray/rooms.model';
import { action, makeObservable, observable, runInAction } from 'mobx';

/**
 * Room
 *
 * A room is a list of participants,
 * participants can stream various track types to the rooms participants.
 */
import { EventEmitter } from 'events';
import { SlipType } from 'os/services/slip.service';
import { Patp } from 'os/types';
import type TypedEmitter from 'typed-emitter';
import { LocalParticipant } from '../participant/local';
import { RemoteParticipant } from '../participant/remote';
import { RoomState } from './types';
import { ParticipantEvent } from '../participant/events';

const peerConnectionConfig = {
  iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
};

export class Room extends (EventEmitter as new () => TypedEmitter<RoomEventCallbacks>) {
  state: RoomState = RoomState.Disconnected;
  our!: LocalParticipant;
  participants: Map<Patp, RemoteParticipant>;

  constructor() {
    super();
    this.participants = new Map();
    // We need to make this observable so the React component can get updates
    makeObservable(this, {
      state: observable,
      participants: observable,
      connect: action.bound,
      connectParticipant: action.bound,
      kickParticipant: action.bound,
      registerListeners: action.bound,
      disconnect: action.bound,
    });
  }

  connect(our: Patp, room: RoomsModelType) {
    this.state = RoomState.Starting;
    this.our = new LocalParticipant(our);
    window.electron.os.slip.onSlip((_event: any, slip: SlipType) => {
      // console.log('got slapped', slip.from, slip.data);
      if (this.state !== RoomState.Disconnected) {
        const peer = this.participants.get(slip.from);
        peer?.handleSlip(slip.data, this.our.patpId);
      } else {
        console.log('you dont need this for Rooms');
      }
    });

    room.present.forEach((peer: Patp) => {
      if (peer === this.our.patp) return;
      // const remote = new RemoteParticipant(peer, peerConnectionConfig);
      // this.participants.set(peer, remote);
      // this.registerListeners(remote);
      // this.addParticipant(remote);
      this.newParticipant(peer);
    });

    this.emit(RoomState.Started);
  }

  newParticipant(peer: Patp) {
    const remote = new RemoteParticipant(peer, peerConnectionConfig);
    this.participants.set(peer, remote);
    this.registerListeners(remote);
    this.connectParticipant(remote);
  }

  // new peer joined
  connectParticipant(peer: RemoteParticipant) {
    // Call or listen
    const isOfferer = this.our.patpId < peer.patpId;
    const mount = document.getElementById('audio-root')!;
    let peerAudioEl: any = document.getElementById(`voice-stream-${peer.patp}`);
    if (!peerAudioEl) {
      peerAudioEl = document.createElement('audio');
      mount.appendChild(peerAudioEl);
    }
    peer.registerAudio(peerAudioEl);
    if (!isOfferer) {
      this.our.sendSignal(peer.patp, 'awaiting-offer', '');
    }
  }

  kickParticipant(peer: Patp) {
    console.log(peer);
  }

  registerListeners(peer: RemoteParticipant) {
    peer.removeAllListeners();
    peer.on(ParticipantEvent.Connected, () => {
      console.log('WE ARE CONNECTED BRUH');
    });
    peer.on(ParticipantEvent.Disconnected, () => {
      console.log('try to reconnect');
      if (this.participants.has(peer.patp)) {
        // if the peer is still in the room,
        this.removePeerAudio(peer.patp);
        console.log('awaiting offer again');
        this.connectParticipant(peer);
      }
    });
    peer.on(ParticipantEvent.Connecting, () => {
      console.log('show connecting state');
    });
    peer.on(ParticipantEvent.AudioStreamAdded, (remoteStream: MediaStream) => {
      console.log('audiostream', remoteStream);
    });
  }

  removePeerAudio(patp: Patp) {
    const peerAudio = document.getElementById(`voice-stream-${patp}`);
    peerAudio && document.getElementById('audio-root')?.removeChild(peerAudio);
  }

  reset() {
    this.participants.forEach((peer: RemoteParticipant) => {
      this.removePeerAudio(peer.patp);
    });
  }

  disconnect() {
    this.participants = new Map();
    this.state = RoomState.Disconnected;
  }
}

export type RoomEventCallbacks = {
  started: () => void;
  connectionStateChanged: (state: RoomState) => void;
  mediaDevicesChanged: () => void;

  /** @deprecated stateChanged has been renamed to connectionStateChanged */
  // stateChanged: (state: ConnectionState) => void;
  // connectionStateChanged: (state: ConnectionState) => void;
  // participantConnected: (participant: RemoteParticipant) => void;
  // participantDisconnected: (participant: RemoteParticipant) => void;
  // trackPublished: (
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackSubscribed: (
  //   track: RemoteTrack,
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackSubscriptionFailed: (
  //   trackSid: string,
  //   participant: RemoteParticipant
  // ) => void;
  // trackUnpublished: (
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackUnsubscribed: (
  //   track: RemoteTrack,
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackMuted: (publication: TrackPublication, participant: Participant) => void;
  // trackUnmuted: (
  //   publication: TrackPublication,
  //   participant: Participant
  // ) => void;
  // localTrackPublished: (
  //   publication: LocalTrackPublication,
  //   participant: LocalParticipant
  // ) => void;
  // localTrackUnpublished: (
  //   publication: LocalTrackPublication,
  //   participant: LocalParticipant
  // ) => void;
  // participantMetadataChanged: (
  //   metadata: string | undefined,
  //   participant: RemoteParticipant | LocalParticipant
  // ) => void;
  // participantPermissionsChanged: (
  //   prevPermissions: ParticipantPermission,
  //   participant: RemoteParticipant | LocalParticipant
  // ) => void;
  // activeSpeakersChanged: (speakers: Array<Participant>) => void;
  // roomMetadataChanged: (metadata: string) => void;
  // dataReceived: (
  //   payload: Uint8Array,
  //   participant?: RemoteParticipant,
  //   kind?: DataPacket_Kind
  // ) => void;
  // connectionQualityChanged: (
  //   quality: ConnectionQuality,
  //   participant: Participant
  // ) => void;
  // mediaDevicesError: (error: Error) => void;
  // trackStreamStateChanged: (
  //   publication: RemoteTrackPublication,
  //   streamState: Track.StreamState,
  //   participant: RemoteParticipant
  // ) => void;
  // trackSubscriptionPermissionChanged: (
  //   publication: RemoteTrackPublication,
  //   status: TrackPublication.SubscriptionStatus,
  //   participant: RemoteParticipant
  // ) => void;
  // audioPlaybackChanged: (playing: boolean) => void;
  // signalConnected: () => void;
};
