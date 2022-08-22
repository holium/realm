import { ParticipantEvent, PeerConnectionState } from './events';
import { Patp } from 'os/types';
import { MutableRefObject } from 'react';
import { ConnectionState, Participant } from '.';
import { DataPacket } from '../helpers/data-packet';
import { RoomsModelType } from 'os/services/tray/rooms.model';
import { LocalTrack } from '../track';
import { Room } from '../room';

// const lossyDataChannel = '_lossy';
// const dataChannel = '_reliable';

const DATA_CHANNEL_LABEL = '_peerdata';

export class RemoteParticipant extends Participant {
  private peerConn: RTCPeerConnection;
  private audioRef!: HTMLAudioElement;
  private audioStream?: MediaStream;
  private dataChannel!: RTCDataChannel;
  private dataChannelSub?: RTCDataChannel;
  private waitInterval?: number;
  publish: any;
  private sender?: RTCRtpSender;

  get connectionState(): RTCPeerConnectionState {
    return this.peerConn.connectionState;
  }

  constructor(patp: Patp, config: RTCConfiguration, room: Room) {
    super(patp, room);
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(config);
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
    setTimeout(this.sendAwaitingOffer, 5000);
    // @ts-ignore
    // this.waitInterval = setInterval(this.sendAwaitingOffer, 5000);
  };

  async streamAudioTrack(track: MediaStreamTrack) {
    this.sender = this.peerConn.addTrack(track);
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
      console.log(event);
    };
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
    console.log('slip', isLower, this.peerConn.connectionState);
    if (this.connectionState === PeerConnectionState.Connected) return;
    if (slipData['awaiting-offer'] !== undefined) {
      // Higher patp sends this offer, lower returns
      console.log('awaiting-offer');
      if (isLower) return;
      // if (this.peerConn.connectionState !== 'new') return;
      const offer = await this.peerConn.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConn.setLocalDescription(offer);
      this.sendSignal(this.patp, 'offer', this.peerConn.localDescription);
    } else if (slipData['ice-candidate']) {
      console.log('ice-candidate');
      let iceCand = JSON.parse(slipData['ice-candidate']);
      await this.peerConn.addIceCandidate({
        candidate: iceCand.candidate,
        sdpMid: iceCand.sdpMid,
        sdpMLineIndex: iceCand.sdpMLineIndex,
      });
    } else if (slipData['offer']) {
      clearTimeout(this.waitInterval);
      // isHigher skips this logic
      if (!isLower) return;
      // isLower gets offer they were awaiting
      console.log('offer');
      await this.peerConn.setRemoteDescription(slipData['offer']);
      const answer = await this.peerConn.createAnswer();
      await this.peerConn.setLocalDescription(answer);
      // isLower sends answer
      this.sendSignal(this.patp, 'answer', this.peerConn.localDescription);
    } else if (slipData['answer']) {
      console.log('answer');
      // isHigher receives answers
      this.waitInterval = undefined;
      if (isLower) {
        return;
      }
      await this.peerConn.setRemoteDescription(slipData['answer']);
    }
  }

  // -----------------------------------------------------------------------------------
  // --------------------------------- Event handlers ----------------------------------
  // -----------------------------------------------------------------------------------
  async onTrack(event: RTCTrackEvent) {
    const [remoteStream] = event.streams;
    this.audioRef.setAttribute('id', `voice-stream-${this.patp}`);
    this.audioRef.setAttribute('autoPlay', '');
    this.audioRef.srcObject = remoteStream;
    this.toggleMuted();
    // this.audioStream = remoteStream;
    this.emit(ParticipantEvent.AudioStreamAdded, remoteStream);
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
      this.audioStream = undefined;
    }
    if (
      // @ts-ignore
      event.currentTarget.connectionState === PeerConnectionState.Failed
    ) {
      console.log('peer connect failed!');
      this.emit(PeerConnectionState.Failed);
      this.audioStream = undefined;
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
  private createDataChannel() {
    this.peerConn.createDataChannel('realm:remote-cursor');

    // clear old data channel callbacks if recreate
    if (this.dataChannel) {
      this.dataChannel.onmessage = null;
      this.dataChannel.onerror = null;
    }

    // create data channels
    this.dataChannel = this.peerConn.createDataChannel(DATA_CHANNEL_LABEL, {
      ordered: true,
    });
    this.dataChannel.onmessage = this.handleDataMessage;
    this.dataChannel.onerror = this.handleDataError;
  }

  private handleDataMessage = async (message: MessageEvent) => {
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
    const dp = DataPacket.decode(new Uint8Array(buffer));
    if (dp.value?.$case === 'cursor') {
      this.emit(ParticipantEvent.CursorUpdate, dp.value?.data);
    }
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
