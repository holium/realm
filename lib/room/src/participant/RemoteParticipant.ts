import { debounce } from 'ts-debounce';
import { ParticipantEvent, PeerConnectionState } from './events';
import { Participant } from './Participant';
import { DataPacket } from '../helpers/data-packet';
import { Room } from '../room';
import { Patp } from '../types';
import { LocalTrack } from '../track/LocalTrack';
import LocalAudioTrack from '../track/LocalAudioTrack';
import RemoteTrackPublication from '../track/RemoteTrackPublication';
import { Track } from '../track/Track';
import RemoteAudioTrack from '../track/RemoteAudioTrack';

// const lossyDataChannel = '_lossy';
// const dataChannel = '_reliable';
export enum DataChannel {
  Info = 1,
  Cursor = 2,
}
const DATA_CHANNEL_LABEL = '_peerdata';

export class RemoteParticipant extends Participant {
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

  get connectionState(): RTCPeerConnectionState {
    return this.peerConn.connectionState;
  }

  constructor(patp: Patp, config: RTCConfiguration, room: Room) {
    super(patp, room);
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(config);
    // this.dataChannel = this.peerConn.createDataChannel(DATA_CHANNEL_LABEL);
    this.config = config;

    this.tracks = new Map();
    this.audioTracks = new Map();
    this.videoTracks = new Map();

    this.sendAwaitingOffer = this.sendAwaitingOffer.bind(this);

    // Bind all listeners to this
    this.onTrack = this.onTrack.bind(this);
    this.onConnectionChange = this.onConnectionChange.bind(this);
    this.onIceCandidate = this.onIceCandidate.bind(this);
    this.onGathering = this.onGathering.bind(this);
    this.onNegotiation = this.onNegotiation.bind(this);
    this.onIceError = this.onIceError.bind(this);
  }

  toggleMuted() {
    this.isMuted = !this.isMuted;
  }

  toggleCursors() {
    this.isCursorSharing = !this.isCursorSharing;
  }

  sendAwaitingOffer = async () => {
    console.log('sending ready');
    this.sendSignal(this.patp, 'awaiting-offer', '');
    // @ts-ignore
    this.timer = setTimeout(this.sendAwaitingOffer, 5000);
    // this.waitInterval = setInterval(this.sendAwaitingOffer, 5000);
  };

  async streamAudioTrack(track: LocalAudioTrack) {
    const audioTrack = track as LocalAudioTrack;
    this.sender = this.peerConn.addTrack(
      audioTrack.mediaStreamTrack,
      audioTrack.mediaStream!
    );
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
  async registerAudio(audioRef: HTMLAudioElement) {
    this.audioRef = audioRef;
    this.audioRef.setAttribute('id', `voice-${this.patp}`);

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
    this.peerConn.ondatachannel = (event: RTCDataChannelEvent) => {
      console.log('data channel', event);
    };
    this.peerConn.onsignalingstatechange = (ev: Event) => {
      console.log('signal', ev);
    };
    // this.peerConn.sctp
  }

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
    const isLower = ourPatpId < this.patpId;
    if (this.peerConn.connectionState === PeerConnectionState.Connected) return;
    if (slipData['awaiting-offer'] !== undefined) {
      // Higher patp sends this offer, lower returns
      if (isLower) return;
      console.log('got awaiting-offer');
      // if (this.peerConn.connectionState !== 'new') return;
      const offer = await this.peerConn.createOffer({
        offerToReceiveAudio: true,
        // offerToReceiveVideo: true,
      });
      await this.peerConn.setLocalDescription(offer);
      console.log('sending offer');
      this.sendSignal(this.patp, 'offer', this.peerConn.localDescription);
    } else if (slipData['ice-candidate']) {
      console.log('ice-candidate');
      if (!this.peerConn.remoteDescription) return;
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
      if (!isLower) return;
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
      if (isLower) {
        return;
      }
      console.log('got answer');
      await this.peerConn.setRemoteDescription(slipData['answer']);
    }
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
      remotePub.setTrack(
        new RemoteAudioTrack(track, remotePub.trackSid, event.receiver)
      );
      this.tracks.set(remotePub.trackName, remotePub);
      this.audioTracks.set(remotePub.trackName, remotePub);
      remotePub.track?.attach(this.audioRef);
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
    console.log(this.dataChannel.readyState);
    // this.peerConn.
    if (this.dataChannel.readyState === 'open')
      this.dataChannel.send(JSON.stringify(info));
  }

  protected addTrackPublication(publication: RemoteTrackPublication) {
    super.addTrackPublication(publication);

    // // register action events
    // publication.on(
    //   TrackEvent.UpdateSettings,
    //   (settings: UpdateTrackSettings) => {
    //     log.debug('send update settings', settings);
    //     this.signalClient.sendUpdateTrackSettings(settings);
    //   }
    // );
    // publication.on(TrackEvent.UpdateSubscription, (sub: UpdateSubscription) => {
    //   sub.participantTracks.forEach((pt) => {
    //     pt.participantSid = this.sid;
    //   });
    //   this.signalClient.sendUpdateSubscription(sub);
    // });
    // publication.on(
    //   TrackEvent.SubscriptionPermissionChanged,
    //   (status: TrackPublication.SubscriptionStatus) => {
    //     this.emit(
    //       ParticipantEvent.TrackSubscriptionPermissionChanged,
    //       publication,
    //       status
    //     );
    //   }
    // );
    // publication.on(TrackEvent.Subscribed, (track: RemoteTrack) => {
    //   this.emit(ParticipantEvent.TrackSubscribed, track, publication);
    // });
    // publication.on(TrackEvent.Unsubscribed, (previousTrack: RemoteTrack) => {
    //   this.emit(ParticipantEvent.TrackUnsubscribed, previousTrack, publication);
    // });
  }

  onConnectionChange(event: Event) {
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Connected
    ) {
      console.log('peers connected!');
      this.emit(PeerConnectionState.Connected);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Connecting
    ) {
      console.log('peers connecting!');
      this.emit(PeerConnectionState.Connecting);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Disconnected
    ) {
      console.log('peers Disconnected!');
      this.emit(PeerConnectionState.Disconnected);
      this.audioRef.parentElement?.removeChild(this.audioRef);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Failed
    ) {
      console.log('peer connect failed!');
      this.emit(PeerConnectionState.Failed);
      this.audioRef.parentElement?.removeChild(this.audioRef);
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Closed
    ) {
      console.log('peer connect closed!');
      this.reset();
      this.emit(PeerConnectionState.Closed);
      this.audioRef.parentElement?.removeChild(this.audioRef);
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
        console.log('gathering');
        break;
      case 'complete':
        /* collection of candidates is finished */
        console.log('complete');
        // this.waitInterval;
        break;
    }
  }

  async onNegotiation(event: Event) {
    console.log('negneeded');
  }

  /**
   * createDataChannel
   *
   * Creates and listens for peer data
   *
   * @param audioRef
   */
  createDataChannel() {
    // clear old data channel callbacks if recreate
    if (this.dataChannel) {
      this.dataChannel.onmessage = null;
      this.dataChannel.onerror = null;
      this.dataChannel.onopen = null;
    }

    try {
      this.dataChannel = this.peerConn.createDataChannel(DATA_CHANNEL_LABEL);
    } catch (e) {
      console.error(e);
    }
    // this.peerConn.nego
    // create data channels
    console.log('cerating data channel', this.dataChannel);
    this.dataChannel.onopen = (ev: Event) => {
      console.log('data channel openeed');
      this.dataChannel.send('test');
    };
    this.dataChannel.onmessage = this.handleDataMessage;
    this.dataChannel.onerror = this.handleDataError;
  }

  private handleDataMessage = async (message: MessageEvent) => {
    console.log(message);
    // decode
    let buffer: ArrayBuffer | undefined;
    if (message.data instanceof ArrayBuffer) {
      buffer = message.data;
    } else if (message.data instanceof Blob) {
      buffer = await message.data.arrayBuffer();
    } else {
      console.error('unsupported data type', message.data);
      return;
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

  reset() {
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(this.config);
  }
}
