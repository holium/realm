import SimplePeer from 'simple-peer';
import { action, makeObservable, observable } from 'mobx';
import { patp2dec } from 'urbit-ob';
import { Patp, PeerConnectionState } from '../types';
import { DataPacket, DataPacket_Kind } from '../helpers/data';
import { Peer, PeerConfig } from './Peer';

export class RemotePeer extends Peer {
  our: Patp;
  peer: SimplePeer.Instance;
  isInitiator: boolean;
  sendSignal: (peer: Patp, data: any) => void;

  constructor(
    our: Patp,
    peer: Patp,
    config: PeerConfig & { isInitiator: boolean },
    sendSignal: (peer: Patp, data: any) => void
  ) {
    super(peer, config);
    this.our = our;
    this.isInitiator = config.isInitiator;
    this.sendSignal = sendSignal;
    this.peer = new SimplePeer({
      initiator: this.isInitiator,
      config: config.rtc,
      objectMode: true,
    });
    this.peer.on('connect', this._onConnect.bind(this));
    this.peer.on('close', this._onClose.bind(this));
    this.peer.on('error', this._onError.bind(this));
    this.peer.on('signal', this._onSignal.bind(this));
    this.peer.on('stream', this._onStream.bind(this));
    this.peer.on('data', this._onData.bind(this));
    this.peer.on('track', this._onTrack.bind(this));
    makeObservable(this, {
      peer: observable,
      _onConnect: action.bound,
      _onClose: action.bound,
      _onError: action.bound,
      _onSignal: action.bound,
      _onStream: action.bound,
      _onTrack: action.bound,
      _onData: action.bound,
    });
  }

  static isInitiator(localPatpId: number, remotePatp: Patp) {
    return localPatpId < patp2dec(remotePatp);
  }

  _onConnect() {
    console.log('RemotePeer onConnect', this.patp);
    this.status = PeerConnectionState.Connected;
    this.sendData({
      kind: DataPacket_Kind.DATA,
      value: {
        data: {
          from: this.our,
          to: this.patp,
          msg: 'Hi',
        },
      },
    });
  }
  _onClose(data: any) {
    console.log('RemotePeer onClose', data);
    this.status = PeerConnectionState.Closed;
  }
  _onError(data: any) {
    console.log('RemotePeer onError', data);
    this.status = PeerConnectionState.Failed;
  }
  _onSignal(data: any) {
    this.sendSignal(this.patp, data);
    this.status = PeerConnectionState.Connecting;
  }
  _onStream(stream: any) {
    console.log('RemotePeer onStream', stream);
  }
  _onTrack(track: MediaStreamTrack, stream: MediaStream) {
    console.log('RemotePeer onTrack', track, stream);
  }
  _onData(data: any) {
    console.log('RemotePeer onData', JSON.parse(data));
  }

  sendData(data: DataPacket): void {
    if (this.status !== PeerConnectionState.Connected) {
      throw new Error("can't send data unless connected");
    }
    this.peer?.send(JSON.stringify(data));
  }

  hangup() {
    this.peer?.destroy();
  }
  // init() {
  //   // Clear any previous listeners
  //   this.peerConn.ontrack = null;
  //   this.peerConn.onconnectionstatechange = null;
  //   this.peerConn.onicecandidate = null;
  //   this.peerConn.onicecandidateerror = null;
  //   this.peerConn.onicegatheringstatechange = null;
  //   this.peerConn.onnegotiationneeded = null;
  //   this.peerConn.ondatachannel = null;
  //   // Register new listeners
  //   this.peerConn.ontrack = this.onTrack;
  //   this.peerConn.onconnectionstatechange = this.onConnectionChange;
  //   this.peerConn.onicecandidate = this.onIceCandidate;
  //   this.peerConn.onicecandidateerror = this.onIceError;
  //   this.peerConn.onicegatheringstatechange = this.onGathering;
  //   this.peerConn.onnegotiationneeded = this.onNegotiation;
  //   this.peerConn.ondatachannel = (evt: RTCDataChannelEvent) => {
  //     evt.channel.send(JSON.stringify({ type: 'connected', data: null }));
  //     // this.dataChannel = evt.channel;
  //     // this.dataChannel.onmessage = this.handleDataMessage;
  //     // this.dataChannel.onopen = (evt: any) => {
  //     //   console.log('data channel open');
  //     // };
  //     // this.dataChannel.onclose = (evt: any) => {
  //     //   console.log('data channel closed');
  //     // };
  //   };
  //   this.peerConn.sctp
  // }

  // onTrack(event: RTCTrackEvent) {
  //   console.log('remote peer onTrack', event);
  // }

  // onConnectionChange(event: Event) {}

  // onIceCandidate(event: RTCPeerConnectionIceEvent) {
  //   if (event.candidate === null) return;
  //   let can = JSON.stringify(event.candidate!.toJSON());
  //   // this.sendSignal(this.patp, 'ice-candidate', can);
  // }

  // onIceError(event: Event) {
  //   console.log('ice candidate error', event);
  // }

  // onGathering(event: Event) {
  //   if (!event) return;
  //   if (!event.target) return;
  //   if (!(event.target instanceof RTCPeerConnection)) return;
  //   let connection: RTCPeerConnection = event.target;
  //   switch (connection.iceGatheringState!) {
  //     case 'gathering':
  //       /* collection of candidates has begun */
  //       // console.log('gathering');
  //       break;
  //     case 'complete':
  //       /* collection of candidates is finished */
  //       // console.log('complete');
  //       // this.waitInterval;
  //       break;
  //   }
  // }

  // async onNegotiation(event: Event) {
  //   // console.log('negneeded', event);
  // }
}
