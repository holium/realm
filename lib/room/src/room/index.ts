/**
 * Room
 *
 * A room is a list of participants,
 * participants can stream various track types to the rooms participants.
 */
import { EventEmitter } from 'events';
import type TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { LocalParticipant } from '../participant/LocalParticipant';
import { RemoteParticipant } from '../participant/RemoteParticipant';
import {
  RoomState,
  EnterDiff,
  ExitDiff,
  DiffType,
  Patp,
  RoomsModelType,
  SlipType,
} from '../types';
import { ParticipantEvent } from '../participant/events';

const peerConnectionConfig = {
  iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
};

export class Room extends (EventEmitter as new () => TypedEmitter<RoomEventCallbacks>) {
  our!: LocalParticipant;
  isHost: boolean = false;
  participants: Map<Patp, RemoteParticipant>;
  roomConfig!: RoomsModelType;
  sendSlip: (to: Patp[], data: any) => void;
  state: RoomState = RoomState.Disconnected;

  constructor(sendSlip: (to: Patp[], data: any) => void) {
    super();
    this.participants = new Map();
    this.sendSlip = sendSlip;

    // We need to make this observable so the React component can get updates
    makeObservable(this, {
      state: observable,
      our: observable,
      participants: observable,
      connect: action.bound,
      connectParticipant: action.bound,
      kickParticipant: action.bound,
      registerListeners: action.bound,
      disconnect: action.bound,
    });
  }

  init(our: Patp) {
    this.state = RoomState.Starting;
    this.our = new LocalParticipant(our, this);
  }

  connect(room: RoomsModelType) {
    this.state = RoomState.Starting;
    this.roomConfig = room;
    if (!this.our) {
      throw new Error('You must run init() before connecting');
    }
    if (this.roomConfig.creator === this.our.patp) {
      this.isHost = true;
    }
    this.our.connect();
    this.our.on(ParticipantEvent.LocalTrackPublished, (pub: any) => {
      console.log(ParticipantEvent.LocalTrackPublished, pub);
    });
    this.our.on(ParticipantEvent.LocalTrackUnpublished, (pub: any) => {
      console.log(ParticipantEvent.LocalTrackUnpublished, pub);
    });

    room.present.forEach((peer: Patp) => {
      if (peer === this.our.patp) return;
      this.newParticipant(peer);
    });

    this.emit(RoomState.Started);
  }

  leave() {
    console.log('in LiveRoom.leave()');
    this.state = RoomState.Disconnected;
    this.participants.forEach((peer: RemoteParticipant) => {
      this.kickParticipant(peer.patp);
    });
    this.participants.clear();
    if (this.our) this.our.disconnect();
    this.removeAllListeners();
  }

  reconnectPeer(peer: Patp) {
    this.participants.get(peer)?.reconnect();
  }

  onSlip(slip: SlipType) {
    if (this.state !== RoomState.Disconnected) {
      const peer = this.participants.get(slip.from);
      peer?.handleSlip(slip.data, this.our.patpId);
    }
  }

  onDiff(roomDiff: DiffType, room: RoomsModelType) {
    // Cast to types
    const enterDiff = roomDiff as EnterDiff;
    const exitDiff = roomDiff as ExitDiff;
    // check if type has enter
    if (enterDiff.enter) {
      if (enterDiff.enter === this.our.patp) {
        // We have created a room or have entered a room
        // console.log('calling connect from enter diff', enterDiff)
        this.connect(room);
        return;
      }
      // console.log('calling new part from enter diff');
      this.newParticipant(enterDiff.enter);
    }
    // check if type has exit
    if (exitDiff.exit) {
      if (exitDiff.exit === this.our.patp) {
        // console.log('we should leave the room and unsub', exitDiff);
        // we've been kicked from the room
        this.leave();
      } else {
        this.kickParticipant(exitDiff.exit);
      }
    }
  }

  newParticipant(peer: Patp) {
    const remote = new RemoteParticipant(peer, peerConnectionConfig, this);
    this.participants.set(peer, remote);
    this.registerListeners(remote);
    this.connectParticipant(remote);
  }

  // new peer joined
  connectParticipant(peer: RemoteParticipant) {
    // Call or listen
    peer.emit(ParticipantEvent.Connecting);
    const isLower = this.our.patpId < peer.patpId;
    console.log('connectParticipant - isLower', isLower);
    // TODO if isHost=true, take all peer audio and stream to all other peers
    peer.registerAudio();
    this.our.streamTracks(peer);
    if (isLower) {
      console.log('we are ready', peer.patp);
      peer.sendAwaitingOffer();
    }
  }

  async kickParticipant(peer: Patp) {
    if (peer === this.our.patp) {
      // hmm i feel like this shouldnt ever happen
      this.leave();
      return;
    }

    await this.participants.get(peer)?.cleanup();
    this.participants.delete(peer);
  }

  registerListeners(peer: RemoteParticipant) {
    // peer.on(ParticipantEvent.Connected, () => {
    //   console.log(peer);
    // });
    peer.on(ParticipantEvent.Disconnected, () => {
      console.log('try to reconnect');
      if (this.participants.has(peer.patp)) {
        // if the peer is still in the room,
        this.removePeerAudio(peer.patp);
        console.log('awaiting offer again');
        this.connectParticipant(peer);
      }
    });
    peer.on(ParticipantEvent.Failed, () => {
      console.log('try to reconnect');
      if (this.participants.has(peer.patp)) {
        // if the peer is still in the room,
        this.removePeerAudio(peer.patp);
        console.log('peer connection failed');
      }
    });
  }

  removePeerAudio(patp: Patp) {
    const peerAudio = document.getElementById(`voice-stream-${patp}`);
    peerAudio && document.getElementById('audio-root')?.removeChild(peerAudio);
  }

  disconnect() {
    this.participants = new Map();
    this.state = RoomState.Disconnected;
  }
}

export interface RoomEventCallbacks {
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
}
