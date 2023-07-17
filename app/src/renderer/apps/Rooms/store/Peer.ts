import EventsEmitter from 'events';
import { action, makeObservable, observable } from 'mobx';
import Peer, { Instance as PeerInstance } from 'simple-peer';

import { serialize, unserialize } from './helpers';
import { DataPacket, DataPayload } from './room.types';
import { OnDataChannel, OnLeftRoom } from './RoomsStore';
import { IAudioAnalyser, SpeakingDetectionAnalyser } from './SpeakingDetector';

const DataPacketMuteStatus = 3;
// const DataPacketSpeakingChanged = 4;
//
export class PeerClass extends EventsEmitter {
  @observable rid: string;
  @observable ourId: string;
  @observable peerId: string;
  @observable peer: PeerInstance;
  @observable websocket: WebSocket;
  @observable hasVideo = false;
  @observable isScreenSharing = false;
  @observable isMuted = false;
  @observable isForceMuted = false;
  @observable isSpeaking = false;
  @observable isAudioAttached = false;
  @observable status = 'disconnected';
  @observable analysers: IAudioAnalyser[] = [];
  @observable audioTracks: Map<string, any> = new Map();
  @observable audioStream: MediaStream | null = null;
  @observable videoStream: MediaStream | null = null;
  @observable videoTracks: Map<string, any> = new Map();
  @observable stream: MediaStream | null = null;
  @observable ourStreams: MediaStream[];
  @observable reconnectAttempts = 0;

  @observable onDataChannel: OnDataChannel = async () => {};
  @observable onLeftRoom: OnLeftRoom = async () => {};

  constructor(
    rid: string,
    ourId: string,
    peerId: string,
    initiator: boolean,
    stream: MediaStream[],
    websocket: WebSocket,
    listeners: {
      onDataChannel: OnDataChannel;
      onLeftRoom: OnLeftRoom;
    }
  ) {
    super();
    if (!rid || !ourId || !peerId || !stream || !websocket || !listeners) {
      throw new Error('Invalid parameters provided for PeerClass');
    }
    makeObservable(this);
    this.rid = rid;
    this.websocket = websocket;
    this.peerId = peerId;
    this.ourStreams = stream;
    this.ourId = ourId;
    this.peer = this.createPeer(peerId, initiator, stream);
    this.onDataChannel = listeners.onDataChannel;
    this.onLeftRoom = listeners.onLeftRoom;
  }

  @action
  forceMute() {
    this.isForceMuted = true;
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  @action
  forceUnmute() {
    this.isForceMuted = false;
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
  }

  @action
  isSpeakingChanged(isSpeaking: boolean) {
    this.isSpeaking = isSpeaking;
    this.emit('isSpeakingChanged', isSpeaking);
  }

  @action
  isMutedChanged(isMuted: boolean) {
    this.isMuted = isMuted;
    this.emit('isMutedChanged', isMuted);
  }

  @action
  isAudioAttachedChanged(isAudioAttached: boolean) {
    this.isAudioAttached = isAudioAttached;
  }

  @action
  hasVideoChanged(hasVideo: boolean) {
    this.hasVideo = hasVideo;
  }

  setNewStream(stream: MediaStream) {
    // this.peer.removeStream(this.ourStreams);
    this.peer.addStream(stream);
    this.ourStreams.push(stream);
    // this.ourStreams = stream;
  }

  @action
  setAudioOutputDevice(deviceId: string) {
    // const video = document.getElementById(
    //     `peer-video-${this.peerId}`
    // ) as HTMLVideoElement;
    // video.setSinkId(deviceId);
    const audio = document.getElementById(
      `peer-audio-${this.peerId}`
    ) as HTMLAudioElement;
    // @ts-expect-error
    audio.setSinkId(deviceId);
  }

  @action
  createPeer(peerId: string, initiator: boolean, streams: MediaStream[]) {
    this.status = 'connecting';
    const peer = new Peer({
      initiator: initiator,
      trickle: true,
      channelName: peerId,
      streams,
      config: {
        iceServers: [
          {
            username: 'realm',
            credential: 'zQzjNHC34Y8RqdLW',
            urls: ['turn:coturn.holium.live:3478'],
          },
          {
            urls: ['stun:coturn.holium.live:3478'],
          },
        ],
      },
    });

    peer.removeAllListeners();

    peer.on('signal', (this.onSignal = this.onSignal.bind(this)));
    peer.on('stream', (this.onStream = this.onStream.bind(this)));
    peer.on('connect', (this.onConnect = this.onConnect.bind(this)));
    peer.on('data', (this.onData = this.onData.bind(this)));
    peer.on('track', (this.onTrack = this.onTrack.bind(this)));
    peer.on('error', (this.onError = this.onError.bind(this)));
    peer.on('close', (this.onClose = this.onClose.bind(this)));
    // peer
    return peer;
  }

  @action
  onTrack(track: MediaStreamTrack, stream: MediaStream) {
    if (!track || !(track instanceof MediaStreamTrack)) {
      console.error('Invalid track received in onTrack');
      return;
    }
    console.log('got track', track.id, track.kind);
    if (track.kind === 'video') {
      // console.log('got video track', track.id);
      if (this.videoTracks.has(track.id)) {
        console.log('already have this video track', track.id);
        return;
      }
      if (this.videoTracks.size > 0 && track.label !== 'screen') {
        // only remove old track if its a camera track
        console.log('already have a video track set, replacing');
        const oldTrack = this.videoTracks.values().next().value;
        this.videoTracks.delete(oldTrack.id);
        oldTrack.stop();
      }
      if (track.label === 'screen') {
        console.log('got screen track');
      }
      this.videoTracks.set(track.id, track);
      this.videoStream = stream;

      this.hasVideoChanged(true);
      const video = document.getElementById(
        `peer-video-${this.peerId}`
      ) as HTMLVideoElement;

      // track.onmute = () => {
      //   // triggered when video is stopped by peer
      //   track.stop();
      //   if (!video) return;
      //   video.style.display = 'none';
      //   this.hasVideoChanged(false);
      // };

      if (video) {
        console.log('video stream id', stream.id);
        video.style.display = 'inline-block';
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
      } else {
        console.log('no video element found');
      }
    }
    if (track.kind === 'audio') {
      if (this.audioTracks.has(track.id)) {
        console.log('already have this audio track', track.id);
        return;
      }
      if (this.audioTracks.size > 0) {
        console.log('already have an audio track, removing');
        const oldTrack = this.audioTracks.values().next().value;
        this.audioTracks.delete(oldTrack.id);
        oldTrack.stop();
      }
      this.audioTracks.set(track.id, track);
      this.audioStream = stream;
      this.isAudioAttachedChanged(true);

      this.analysers[0] = SpeakingDetectionAnalyser.initialize(this);
      // create an audio element for the stream
      const audio = document.createElement('audio');
      audio.id = `peer-audio-${this.peerId}`;
      console.log('audio stream id', stream.id);

      audio.srcObject = stream;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
  }

  @action
  onError(err: any) {
    console.error('peer error', err);
    if (this.reconnectAttempts < 5) {
      // limit reconnect attempts to 5
      console.log(
        `Attempting to reconnect (attempt ${this.reconnectAttempts + 1})`
      );
      this.reconnectAttempts++;
      this.retry(this.ourStreams);
    } else {
      console.log('Maximum reconnect attempts reached');
    }
  }

  @action
  onClose() {
    if (!this.peer) {
      console.error('Peer does not exist in onClose');
      return;
    }
    this.status = 'closed';
    this.peer.removeAllListeners();
    this.peer.destroy();
    this.audioTracks.forEach((track) => {
      track.stop();
    });
    this.audioTracks.clear();
    this.isAudioAttachedChanged(false);
    this.isSpeakingChanged(false);
    document.getElementById(`peer-audio-${this.peerId}`)?.remove();

    this.videoTracks.forEach((track) => {
      track.stop();
    });
    this.videoTracks.clear();
    this.hasVideoChanged(false);
    const video = document.getElementById(
      `peer-video-${this.peerId}`
    ) as HTMLVideoElement;

    if (video) {
      video.style.display = 'none';
      video.srcObject = null;
      video.playsInline = false;
    }

    this.analysers.forEach((analyser) => {
      analyser.detach();
    });
  }

  @action
  onSignal(signal: any) {
    try {
      const msg = {
        type: 'signal',
        rid: this.rid,
        signal,
        to: this.peerId,
        from: this.ourId,
      };
      this.websocket.send(serialize(msg));
    } catch (e) {
      console.error('Error in onSignal', e);
    }
  }

  @action
  onStream(_stream: MediaStream) {
    // console.log('onStream', _stream.getTracks());
    // if (this.stream) {
    //   this.stream.getTracks().forEach((track) => {
    //     track.stop();
    //   });
    //   this.peer?.removeStream(this.stream);
    // }
    // this.stream = _stream;
    // this.peer?.addStream(this.stream);
  }

  @action
  onData(data: any) {
    const dataPacket = unserialize(data);
    if (dataPacket.kind === DataPacketMuteStatus) {
      const payload = dataPacket.value as DataPayload;
      if (payload.data) {
        this.isMutedChanged(true);
      } else {
        this.isMutedChanged(false);
      }
    }
    this.onDataChannel(this.rid, this.peerId, dataPacket);
  }

  @action
  onConnect() {
    this.status = 'connected';
    console.log('Peer connected', this.peerId);
  }

  // --------------------

  @action
  sendData(data: Partial<DataPacket>) {
    try {
      if (this.peer) {
        this.peer.send(serialize(data));
      }
    } catch (e) {
      console.error('send error', e);
    }
  }

  @action
  onReceivedSignal(data: any) {
    try {
      if (this.peer) {
        this.peer.signal(data);
      }
    } catch (e) {
      console.error('signal error', e);
    }
  }

  @action
  retry(ourStreams?: MediaStream[]) {
    this.peer.destroy();
    this.peer = this.createPeer(
      this.peerId,
      false,
      ourStreams || this.ourStreams
    );
  }

  @action
  destroy() {
    this.onLeftRoom(this.rid, this.peerId);
    this.peer.destroy();
  }

  // Metadata handling
  @action
  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  @action
  setSpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
  }

  @action
  setAudioAttached(attached: boolean) {
    this.isAudioAttached = attached;
  }

  @action
  setStatus(status: string) {
    this.status = status;
  }
}
