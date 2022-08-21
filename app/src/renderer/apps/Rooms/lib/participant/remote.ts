import { ParticipantEvent } from './../helpers/events';
import { Patp } from 'os/types';
import { MutableRefObject } from 'react';
import { ConnectionState, Participant } from '.';
import { DataPacket } from '../helpers/data-packet';

// const lossyDataChannel = '_lossy';
// const dataChannel = '_reliable';

const DATA_CHANNEL_LABEL = '_peerdata';

export class RemoteParticipant extends Participant {
  private peerConn: RTCPeerConnection;
  private dataChannel!: RTCDataChannel;
  private dataChannelSub?: RTCDataChannel;
  private waitInterval?: number;
  constructor(patp: Patp, config: RTCConfiguration) {
    super(patp);
    this.peerConn = new RTCPeerConnection();
    this.peerConn.setConfiguration(config);

    const sendAwaitingOffer = async () => {
      this.connectionState !== ConnectionState.Connected &&
        this.sendSignal(this.patp, 'awaiting-offer', '');
    };

    // @ts-ignore
    this.waitInterval = setInterval(sendAwaitingOffer, 5000);

    this.peerConn.addEventListener('connectionstatechange', (event: Event) => {
      // @ts-ignore
      if (event.currentTarget.connectionState === ConnectionState.Connected) {
        console.log('peers connected!');
        this.emit(ParticipantEvent.Connected);
      }
      // @ts-ignore
      if (event.currentTarget.connectionState === ConnectionState.Connecting) {
        console.log('peers connecting!');
        this.emit(ParticipantEvent.Connecting);
      }
      if (
        // @ts-ignore
        event.currentTarget.connectionState === ConnectionState.Disconnected
      ) {
        console.log('peers Disconnected!');
        this.emit(ParticipantEvent.Disconnected);
      }
      if (
        // @ts-ignore
        event.currentTarget.connectionState === ConnectionState.Reconnecting
      ) {
        console.log('peers Reconnecting!');
        this.emit(ParticipantEvent.Reconnecting);
      }
    });

    this.peerConn.addEventListener('icecandidate', (e) => {
      if (e.candidate === null) return;
      let can = JSON.stringify(e.candidate!.toJSON());
      this.sendSignal(this.patp, 'ice-candidate', can);
    });

    this.peerConn.onicegatheringstatechange = (event: Event) => {
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
    };
    this.peerConn.addEventListener('negotiationneeded', async (e) => {
      console.log('negneeded');
    });
  }

  /**
   * registerAudio
   *
   * Sets up the track listener for incoming peer audio stream
   *
   * @param audioRef
   */
  async registerAudio(audioRef: HTMLAudioElement) {
    this.peerConn.addEventListener('track', async (event) => {
      const [remoteStream] = event.streams;
      console.log('got remote stream');
      audioRef.setAttribute('id', `voice-stream-${this.patp}`);
      audioRef.setAttribute('autoPlay', '');
      audioRef.srcObject = remoteStream;
      this.connectionState = ConnectionState.Connected;
    });
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
    const isOfferer = ourPatpId < this.patpId;
    console.log('handle slip', this.patpId, ourPatpId);

    if (!isOfferer) {
      console.log('we be hittin that fool with awaitings');
    }

    if (slipData['awaiting-offer'] !== undefined) {
      console.log('awaiting-offer');
      if (!isOfferer) return;
      if (this.peerConn.connectionState !== 'new') return;
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
      // the caller does not receive offers
      if (isOfferer) return;
      clearInterval(this.waitInterval);
      console.log('offer');
      await this.peerConn.setRemoteDescription(slipData['offer']);

      const answer = await this.peerConn.createAnswer();
      await this.peerConn.setLocalDescription(answer);

      this.sendSignal(this.patp, 'answer', this.peerConn.localDescription);
    } else if (slipData['answer']) {
      console.log('answer');
      // only the caller receives answers
      this.waitInterval = undefined;
      if (!isOfferer) {
        return;
      }
      this.createDataChannel();
      await this.peerConn.setRemoteDescription(slipData['answer']);
    }
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
