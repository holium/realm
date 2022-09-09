import { debounce } from 'ts-debounce';
import { action, makeObservable, observable } from 'mobx';
import { ParticipantEvent, PeerConnectionState } from './events';
import { Participant } from './Participant';
import { Room } from '../room';
import { Patp } from '../types';
import { TrackEvent } from '../track/events';
import LocalAudioTrack from '../track/LocalAudioTrack';
import RemoteTrackPublication from '../track/RemoteTrackPublication';
import { Track } from '../track/Track';
import RemoteAudioTrack from '../track/RemoteAudioTrack';
import RemoteTrack from '../track/RemoteTrack';

// const lossyDataChannel = '_lossy';
// const dataChannel = '_reliable';
export enum DataChannel {
  Info = 1,
  Cursor = 2,
}

const RetryLimit = 10;
export class RemoteParticipant extends Participant {
  connectionState: PeerConnectionState = PeerConnectionState.New;
  isLower?: boolean; // if the remote particpant is lower, they are recieving
  volume: number = 1;
  private peerConn: RTCPeerConnection;
  private audioRef!: HTMLAudioElement;
  private dataChannel!: RTCDataChannel;
  audioTracks: Map<string, RemoteTrackPublication>;
  videoTracks: Map<string, RemoteTrackPublication>;
  tracks: Map<string, RemoteTrackPublication>;
  config: RTCConfiguration;
  private timer?: any;
  private sender?: RTCRtpSender;
  publish: any;
  private retryAttempts: number = 0;

  constructor(patp: Patp, config: RTCConfiguration, room: Room) {
    super(patp, room);
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(config);
    this.config = config;

    this.tracks = new Map();
    this.audioTracks = new Map();
    this.videoTracks = new Map();

    makeObservable(this, {
      volume: observable,
      connectionState: observable,
      mute: action.bound,
      unmute: action.bound,
    });

    this.sendAwaitingOffer = this.sendAwaitingOffer.bind(this);
    this.createDataChannel = this.createDataChannel.bind(this);
    this.handleDataMessage = this.handleDataMessage.bind(this);
    this.handleDataError = this.handleDataError.bind(this);

    // Bind all listeners to this
    this.onTrack = this.onTrack.bind(this);
    this.onConnectionChange = this.onConnectionChange.bind(this);
    this.onIceCandidate = this.onIceCandidate.bind(this);
    this.onGathering = this.onGathering.bind(this);
    this.onNegotiation = this.onNegotiation.bind(this);
    this.onIceError = this.onIceError.bind(this);
  }
  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }
  /**
   * sets the volume on the participant's microphone track
   * if no track exists the volume will be applied when the microphone track is added
   */
  setVolume(volume: number) {
    this.volume = volume;
    const audioPublication = this.getTrack(Track.Source.Microphone);
    if (audioPublication && audioPublication.track) {
      (audioPublication.track as RemoteAudioTrack).setVolume(volume);
    }
  }

  /**
   * gets the volume on the participant's microphone track
   */
  getVolume() {
    const audioPublication = this.getTrack(Track.Source.Microphone);
    if (audioPublication && audioPublication.track) {
      return (audioPublication.track as RemoteAudioTrack).getVolume();
    }
    return this.volume;
  }

  async streamAudioTrack(track: LocalAudioTrack) {
    const audioTrack = track as LocalAudioTrack;
    this.sender = this.peerConn.addTrack(
      audioTrack.mediaStreamTrack,
      audioTrack.mediaStream!
    );
    // this.updateOurInfo({  patp: string; muted: boolean; cursor: boolean; })
    // this.dataChannel.send(track);
  }

  async removeAudioTrack() {
    console.log('removing audio track', this.sender);
    this.sender && this.peerConn.removeTrack(this.sender);
  }

  async replaceAudioTrack(track: MediaStreamTrack) {
    this.sender && this.peerConn.removeTrack(this.sender);
    this.sender = this.peerConn.addTrack(track);
  }

  /**
   * registerAudio
   *
   * Sets up the track listener for incoming peer audio stream
   *
   * @param audioRef
   */
  async registerAudio() {
    // Clear any previous listeners
    this.peerConn.ontrack = null;
    this.peerConn.onconnectionstatechange = null;
    this.peerConn.onicecandidate = null;
    this.peerConn.onicecandidateerror = null;
    this.peerConn.onicegatheringstatechange = null;
    this.peerConn.onnegotiationneeded = null;
    this.peerConn.ondatachannel = null;

    // Register new listeners
    this.peerConn.ontrack = this.onTrack;
    this.peerConn.onconnectionstatechange = this.onConnectionChange;
    this.peerConn.onicecandidate = this.onIceCandidate;
    this.peerConn.onicecandidateerror = this.onIceError;
    this.peerConn.onicegatheringstatechange = this.onGathering;
    this.peerConn.onnegotiationneeded = this.onNegotiation;
    this.peerConn.ondatachannel = (evt: RTCDataChannelEvent) => {
      evt.channel.send(JSON.stringify({ type: 'connected', data: null }));
      this.dataChannel = evt.channel;
      this.dataChannel.onmessage = this.handleDataMessage;
      this.dataChannel.onopen = (evt: any) => {
        console.log('data channel open');
      };
      this.dataChannel.onclose = (evt: any) => {
        console.log('data channel closed');
      };
    };

    // this.peerConn.sctp
  }

  // -----------------------------------------------------------------------------------
  // --------------------------------- Event handlers ----------------------------------
  // -----------------------------------------------------------------------------------
  async onTrack(event: RTCTrackEvent) {
    const [remoteStream] = event.streams;
    remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
      const remotePub = new RemoteTrackPublication(
        Track.Kind.Audio,
        remoteStream.id,
        `${this.patp}-audio`
      );
      remotePub._setTrack(
        new RemoteAudioTrack(track, remotePub.trackSid, event.receiver)
      );
      this.tracks.set(remotePub.trackName, remotePub);
      this.audioTracks.set(remotePub.trackName, remotePub);
      remotePub.track?.attach();
      remotePub.setSubscribed(true);
      remotePub.setEnabled(true);
    });

    this.audioTracks.forEach((remotePub: RemoteTrackPublication) => {
      remotePub.track?.on('muted', (track: RemoteAudioTrack) => {
        console.log(this.patp, `${track.sid} has muted`);
      });
      remotePub.track?.on('unmuted', (track: RemoteAudioTrack) => {
        console.log(this.patp, `${track.sid} has unmuted`);
      });
    });

    // this.toggleMuted();
    // this.audioStream = remoteStream;
    this.emit(ParticipantEvent.AudioStreamAdded, remoteStream);
  }

  updateOurInfo(info: { patp: Patp; muted: boolean; cursor: boolean }) {
    // console.log(this.dataChannel);
    // this.peerConn.
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(
        JSON.stringify({ type: 'participant-metadata', data: info })
      );
    }
  }

  protected addTrackPublication(publication: RemoteTrackPublication) {
    super.addTrackPublication(publication);

    publication.on(TrackEvent.Subscribed, (track: RemoteTrack) => {
      this.emit(ParticipantEvent.TrackSubscribed, track, publication);
    });
    publication.on(TrackEvent.Unsubscribed, (previousTrack: RemoteTrack) => {
      this.emit(ParticipantEvent.TrackUnsubscribed, previousTrack, publication);
    });
  }

  onConnectionChange(event: Event) {
    // console.log(event);
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Connected
    ) {
      console.log('peers connected!');
      this.emit(PeerConnectionState.Connected);
      this.connectionState = PeerConnectionState.Connected;
      if (!this.isLower) {
        console.log('creating data channel', this.patp);
      }
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Connecting
    ) {
      console.log('peers connecting!');
      this.connectionState = PeerConnectionState.Connecting;

      this.emit(PeerConnectionState.Connecting);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Disconnected
    ) {
      console.log('peers Disconnected!');
      this.connectionState = PeerConnectionState.Disconnected;
      this.emit(PeerConnectionState.Disconnected);
      // this.audioRef.parentElement?.removeChild(this.audioRef);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Failed
    ) {
      console.log('peer connect failed!');
      this.connectionState = PeerConnectionState.Failed;
      this.emit(PeerConnectionState.Failed);
      // this.audioRef.parentElement?.removeChild(this.audioRef);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Closed
    ) {
      console.log('peer connect closed!');
      this.connectionState = PeerConnectionState.Closed;
      this.reset();
      this.emit(PeerConnectionState.Closed);
      // this.audioRef.parentElement?.removeChild(this.audioRef);
    }
  }

  reset() {
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(this.config);
  }

  reconnect() {
    this.peerConn.restartIce();
  }

  async cleanup() {
    this.tracks.forEach((remotePub: RemoteTrackPublication) => {
      remotePub.track?.detach(this.audioRef);
      remotePub.removeAllListeners();
      console.log('cleainign', this.patp, remotePub.kind, this.audioLevel);
      if (remotePub.kind === Track.Kind.Audio) {
        // const toRemove = document.getElementById(`voice-${this.patp}`)!;
        // const audioRoot = toRemove?.parentElement!;
        // console.log('removing audio tag', toRemove, audioRoot);
        // audioRoot.removeChild(toRemove);
      }
      this.unpublishTrack(remotePub.trackSid, true);
    });
    this.tracks.clear();
    this.audioTracks.clear();
    this.videoTracks.clear();
    await this.removeAudioTrack();
    this.removeAllListeners();
    this.peerConn.close();
  }

  /** @internal */
  unpublishTrack(sid: Track.SID, sendUnpublish?: boolean) {
    const publication = this.tracks.get(sid) as RemoteTrackPublication;
    if (!publication) {
      return;
    }

    this.tracks.delete(sid);

    // remove from the right type map
    switch (publication.kind) {
      case Track.Kind.Audio:
        this.audioTracks.delete(sid);
        break;
      case Track.Kind.Video:
        this.videoTracks.delete(sid);
        break;
      default:
        break;
    }

    // also send unsubscribe, if track is actively subscribed
    const { track } = publication;
    if (track) {
      track.stop();
      publication._setTrack(undefined);
    }
    if (sendUnpublish) {
      this.emit(ParticipantEvent.TrackUnpublished, publication);
    }
  }

  // ----------------------------------------------------------------
  // -------------------------- PeerEngine --------------------------
  // ----------------------------------------------------------------

  sendAwaitingOffer = async () => {
    console.log('sending ready');
    this.sendSignal(this.patp, 'awaiting-offer', '');
    // @ts-ignore
    this.timer = setTimeout(this.sendAwaitingOffer, 5000);
    this.retryAttempts = this.retryAttempts + 1;
    if (this.retryAttempts > RetryLimit) {
      clearTimeout(this.timer);
      this.retryAttempts = 0;
      this.emit(ParticipantEvent.Failed);
    }
    // this.waitInterval = setInterval(this.sendAwaitingOffer, 5000);
  };

  /**
   * handleSlip
   *
   * Handles all signaling events done through the slip agent
   *
   * @param slipData
   * @param ourPatpId
   * @returns
   */
  async handleSlip(slipData: any, ourPatpId: number) {
    this.isLower = ourPatpId < this.patpId;
    if (this.peerConn.connectionState === PeerConnectionState.Connected) return;
    if (slipData['awaiting-offer'] !== undefined) {
      // Higher patp sends this offer, lower returns
      if (this.isLower) return;
      console.log('got awaiting-offer');
      this.createDataChannel(); // the higher patp will create a data channel
      // if (this.peerConn.connectionState !== 'new') return;
      const offer = await this.peerConn.createOffer({
        offerToReceiveAudio: true,
        // offerToReceiveVideo: true,
      });
      await this.peerConn.setLocalDescription(offer);
      console.log('sending offer');
      this.sendSignal(this.patp, 'offer', this.peerConn.localDescription);
    } else if (slipData['ice-candidate']) {
      if (!this.peerConn.remoteDescription) return;
      console.log('ice-candidate');
      let iceCand = JSON.parse(slipData['ice-candidate']);
      await this.peerConn.addIceCandidate({
        candidate: iceCand.candidate,
        sdpMid: iceCand.sdpMid,
        sdpMLineIndex: iceCand.sdpMLineIndex,
      });
    } else if (slipData['offer']) {
      clearTimeout(this.timer);
      this.timer = undefined;
      // isHigher skips this logic
      if (!this.isLower) return;
      // isLower gets offer they were awaiting
      console.log('got offer');
      await this.peerConn.setRemoteDescription(slipData['offer']);
      const answer = await this.peerConn.createAnswer();
      await this.peerConn.setLocalDescription(answer);
      // isLower sends answer
      console.log('sending answer');
      this.sendSignal(this.patp, 'answer', this.peerConn.localDescription);
    } else if (slipData['answer']) {
      // console.log('answer');
      this.timer = undefined;
      // isHigher receives answers
      if (this.isLower) {
        return;
      }
      console.log('got answer');
      await this.peerConn.setRemoteDescription(slipData['answer']);
    }
  }

  onIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate === null) return;
    let can = JSON.stringify(event.candidate!.toJSON());
    this.sendSignal(this.patp, 'ice-candidate', can);
  }

  onIceError(event: Event) {
    console.log('ice candidate error', event);
  }

  onGathering(event: Event) {
    if (!event) return;
    if (!event.target) return;
    if (!(event.target instanceof RTCPeerConnection)) return;
    let connection: RTCPeerConnection = event.target;
    switch (connection.iceGatheringState!) {
      case 'gathering':
        /* collection of candidates has begun */
        // console.log('gathering');
        break;
      case 'complete':
        /* collection of candidates is finished */
        // console.log('complete');
        // this.waitInterval;
        break;
    }
  }

  async onNegotiation(event: Event) {
    // console.log('negneeded', event);
  }

  /**
   * createDataChannel
   *
   * Creates and listens for peer data
   *
   */
  createDataChannel() {
    // clear old data channel callbacks if recreate
    if (this.dataChannel) {
      this.dataChannel.onmessage = null;
      this.dataChannel.onerror = null;
      this.dataChannel.onopen = null;
    }

    try {
      this.dataChannel = this.peerConn.createDataChannel(
        this.room.roomConfig.id
      );
      // console.log(this.dataChannel);
    } catch (e) {
      console.error(e);
    }
    // this.peerConn.nego
    // create data channels
    // console.log('cerating data channel', this.dataChannel);
    this.dataChannel.onopen = (ev: Event) => {
      // this.dataChannel.send('test');
    };
    this.dataChannel.onmessage = this.handleDataMessage;
    this.dataChannel.onerror = this.handleDataError;
  }

  private handleDataMessage = async (message: MessageEvent) => {
    // console.log(message);
    // decode
    let buffer: { type: DataChannelUpdate; data: any };
    if (typeof message.data === 'string') {
      buffer = JSON.parse(message.data);
    } else {
      console.error('unsupported data type', message.data);
      return;
    }
    if (buffer.type === 'participant-metadata') {
      const data = buffer.data as ParticipantUpdate;
      console.log('participant-metadata update', this);
      // const peer = this.room.participants.get(data.patp)!;
      this.audioTracks.forEach((publication: RemoteTrackPublication) => {
        if (data.muted) {
          publication.handleMuted();
          this.mute();
          this.emit(ParticipantEvent.TrackMuted, publication.audioTrack);
        } else {
          publication.handleUnmuted();
          this.unmute();
          this.emit(ParticipantEvent.TrackUnmuted, publication.audioTrack);
        }
        // this.setCursors(data.cursor);
      });
    }
    // const dp = DataPacket.decode(new Uint8Array(buffer));
    // if (dp.value?.$case === 'cursor') {
    //   this.emit(ParticipantEvent.CursorUpdate, dp.value?.data);
    // }
  };

  private handleDataError = (event: Event) => {
    const channel = event.currentTarget as RTCDataChannel;

    if (event instanceof ErrorEvent) {
      const { error } = event.error;
      console.error(
        `DataChannel error on ${channel.label}: ${event.message}`,
        error
      );
    } else {
      console.error(`Unknown DataChannel Error on ${channel.label}`, event);
    }
  };
}

export type DataChannelUpdate = 'participant-metadata' | 'connected';

export type ParticipantUpdate = { patp: Patp; muted: boolean; cursor: boolean };
