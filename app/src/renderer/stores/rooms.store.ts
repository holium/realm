import { observable } from 'mobx';
import { cast, flow, Instance, types } from 'mobx-state-tree';
import SimplePeer from 'simple-peer';
import { patp2dec } from 'urbit-ob';

import {
  DataPacket,
  DataPacket_Kind,
  DataPayload,
  LocalPeer,
  PeerConnectionState,
  PeerEvent,
  // RemotePeer,
  ridFromTitle,
} from '@holium/realm-room';

import { SoundActions } from 'renderer/lib/sound';

import { RoomsIPC } from './ipc';
import { shipStore } from './ship.store';

export const RoomModel = types
  .model('RoomModel', {
    rid: types.identifier,
    provider: types.string,
    creator: types.string,
    access: types.string,
    title: types.string,
    present: types.array(types.string),
    whitelist: types.array(types.string),
    capacity: types.integer,
    path: types.string,
  })
  .actions((self) => ({
    addPeer(patp: string) {
      self.present.push(patp);
    },
    removePeer(patp: string) {
      self.present.remove(patp);
    },
    addWhitelist(patp: string) {
      self.whitelist.push(patp);
    },
    removeWhitelist(patp: string) {
      self.whitelist.remove(patp);
    },
  }));
//
export type RoomMobx = Instance<typeof RoomModel>;

export const ChatModel = types.model('ChatModel', {
  index: types.integer,
  author: types.string,
  contents: types.string,
  isRightAligned: types.boolean,
  timeReceived: types.integer,
});
export type RoomChatMobx = Instance<typeof ChatModel>;

let local: LocalPeer | null;
let peers: Map<string, RemotePeer> = observable(new Map());
let queuedPeers: string[] = observable([]); // peers that we have queued to dial

export function isInitiator(localPatpId: number, remotePatp: string) {
  return localPatpId < patp2dec(remotePatp);
}

export function isDialer(localPatp: string, remotePatp: string) {
  return localPatp < remotePatp;
}

const sendData = (data: Partial<DataPacket>) => {
  const payload = { from: local?.patp, ...data } as DataPacket;
  peers.forEach((peer) => {
    if (peer.status === PeerConnectionState.Connected) {
      peer.sendData(payload);
    }
  });
};

// class emotePeer = ( our: Patp,
//     peer: Patp,
//     config: PeerConfig & { isInitiator: boolean },
//     localPeer: LocalPeer,) => {
//   const peer = new SimplePeer({
//     initiator: this.isInitiator,
//     config: this.rtcConfig,
//     stream: this.localPeer.stream,
//     objectMode: true,
//     trickle: true,
//   });
// };
export function attachToElement(
  track: MediaStreamTrack,
  element: HTMLMediaElement
) {
  let mediaStream: MediaStream;
  if (element.srcObject instanceof MediaStream) {
    mediaStream = element.srcObject;
  } else {
    mediaStream = new MediaStream();
  }

  // check if track matches existing track
  let existingTracks: MediaStreamTrack[];
  if (track.kind === 'audio') {
    existingTracks = mediaStream.getAudioTracks();
  } else {
    existingTracks = mediaStream.getVideoTracks();
  }
  if (!existingTracks.includes(track)) {
    existingTracks.forEach((et) => {
      mediaStream.removeTrack(et);
    });
    mediaStream.addTrack(track);
  }

  //  avoid flicker
  // if (element.srcObject !== mediaStream) {
  //   element.srcObject = mediaStream;
  //   if ((isSafari() || isFireFox()) && element instanceof HTMLVideoElement) {
  //     // Firefox also has a timing issue where video doesn't actually get attached unless
  //     // performed out-of-band
  //     // Safari 15 has a bug where in certain layouts, video element renders
  //     // black until the page is resized or other changes take place.
  //     // Resetting the src triggers it to render.
  //     // https://developer.apple.com/forums/thread/690523
  //     setTimeout(() => {
  //       element.srcObject = mediaStream;
  //       // Safari 15 sometimes fails to start a video
  //       // when the window is backgrounded before the first frame is drawn
  //       // manually calling play here seems to fix that
  //       element.play().catch(() => {
  //         /* do nothing */
  //       });
  //     }, 0);
  //   }
  // }
  // TODO autoplay
  element.autoplay = true;
  if (element instanceof HTMLVideoElement) {
    element.playsInline = true;
  }
  return element;
}

/** @internal */
export function detachTrack(
  track: MediaStreamTrack,
  element: HTMLMediaElement
) {
  if (element.srcObject instanceof MediaStream) {
    const mediaStream = element.srcObject;
    mediaStream.removeTrack(track);
    if (mediaStream.getTracks().length > 0) {
      element.srcObject = mediaStream;
    } else {
      element.srcObject = null;
    }
  }
}
export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
  Unknown = 'unknown',
}

class RemotePeer {
  patp: string;
  patpId: number;
  isInitiator: boolean;
  audioLevel: number = 0;
  isMuted: boolean = false;
  isSpeaking: boolean = false;
  audioTracks: Map<string, any>;
  status: PeerConnectionState = PeerConnectionState.New;
  spInstance: SimplePeer.Instance | null = null;
  rid: string;
  rtcConfig: any;
  isAudioAttached: boolean = false;
  isVideoAttached: boolean = false;

  constructor(
    rid: string,
    patp: string,
    config: { isInitiator: boolean; rtc: any }
  ) {
    this.rid = rid;
    this.patp = patp;
    this.isInitiator = config.isInitiator;
    this.patpId = patp2dec(patp);
    this.rtcConfig = config.rtc;
    this.audioTracks = new Map();
  }

  createConnection() {
    // create the peer connection
    this.spInstance?.removeAllListeners();
    console.log(`create connection to ${this.patp}`);
    if (!local) {
      throw new Error('No local peer created');
    }
    this.spInstance = new SimplePeer({
      initiator: this.isInitiator,
      config: this.rtcConfig,
      stream: local.stream,
      objectMode: true,
      trickle: true,
    });
    this.spInstance.on('connect', this._onConnect.bind(this));
    this.spInstance.on('close', this._onClose.bind(this));
    this.spInstance.on('error', this._onError.bind(this));
    this.spInstance.on('signal', this._onSignal.bind(this));
    this.spInstance.on('stream', this._onStream.bind(this));
    this.spInstance.on('track', this._onTrack.bind(this));
    this.spInstance.on('data', this._onData.bind(this));
  }

  sendSignal(data: SimplePeer.SignalData) {
    RoomsIPC.sendSignal(window.ship, this.patp, this.rid, data);
  }

  sendData(data: DataPacket): void {
    if (this.status !== PeerConnectionState.Connected) {
      console.warn("can't send data unless connected, still trying");
    }
    this.spInstance?.send(JSON.stringify(data));
  }

  dial() {
    // only the waiting peer sends the waiting signal
    if (!this.isInitiator) {
      this.createConnection();
      RoomsIPC.sendSignal(window.ship, this.patp, this.rid, {
        type: 'waiting',
        from: window.ship,
      });
    }
  }

  onWaiting() {
    if (this.isInitiator) {
      this.createConnection();
    }
  }

  peerSignal(data: SimplePeer.SignalData) {
    // TODO go through the flow where a peer is destroyed and attempts to reconnect
    if (!this.spInstance?.destroyed) {
      this.spInstance?.signal(data);
    } else {
      console.log('peerSignal: peer destroyed, not signaling', this.patp);
    }
  }

  _onConnect() {
    console.log('RemotePeer onConnect', this.patp);
    this.setStatus(PeerConnectionState.Connected);
  }

  _onClose() {
    console.log('RemotePeer onClose', this.patp);
    this.setStatus(PeerConnectionState.Closed);
  }

  _onError(err: Error) {
    console.log('RemotePeer onError', this.patp, err);
    // @ts-ignore
    this.setStatus(PeerConnectionState.Failed);
  }

  _onSignal(data: SimplePeer.SignalData) {
    this.sendSignal(data);
    console.log('sendSignal', data.type, data);
    if (this.status !== PeerConnectionState.Connected) {
      this.setStatus(PeerConnectionState.Connecting);
    }
  }

  _onStream(stream: MediaStream) {
    console.log('RemotePeer onStream', this.patp, stream);
    // this.emit(PeerEvent.MediaStreamAdded, stream);
  }

  _onTrack(track: MediaStreamTrack, stream: MediaStream) {
    console.log('track added', track.id, track, stream);
    if (track.kind === 'audio') {
      if (this.audioTracks.size > 0) {
        console.log('audio track already exists, removing', track.id);
        this.removeTracks();
      }
      this.audioTracks.set(track.id, track);
      this.attach(track);
      sendData({
        kind: DataPacket_Kind.MUTE_STATUS,
        value: { data: local?.isMuted },
      });
    }
  }

  _onData(data: any) {
    console.log('RemotePeer onData', this.patp, data);
    if (data.kind === DataPacket_Kind.MUTE_STATUS) {
      const payload = data.value as DataPayload;
      if (payload.data) {
        this.mute();
      } else {
        this.unmute();
      }
    } else if (data.kind === DataPacket_Kind.SPEAKING_CHANGED) {
      const payload = data.value as DataPayload;
      this.isSpeakingChanged(payload.data);
    }
  }

  removeTracks() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.detach(track);
    });

    this.audioTracks.clear();
  }

  mute() {
    this.isMuted = true;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  unmute() {
    this.isMuted = false;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
  }

  isSpeakingChanged(speaking: boolean) {
    this.isSpeaking = speaking;
  }

  hangup() {
    this.removeTracks();
    this.spInstance?.destroy();
  }

  setStatus(status: PeerConnectionState) {
    this.status = status;
  }
  attach(track: MediaStreamTrack): HTMLMediaElement {
    let element: HTMLMediaElement = this.getMediaElement(
      track.kind as TrackKind
    );
    element = attachToElement(track, element);
    if (element instanceof HTMLAudioElement) {
      this.isAudioAttached = true;
      element
        .play()
        .then(() => {
          console.log('playing audio from peer', this.patp);
        })
        .catch((e) => {
          console.error('ERROR: playing audio from peer', this.patp, e);
        });
    } else if (element instanceof HTMLVideoElement) {
      this.isVideoAttached = true;
    }
    // console.log('attached', element);
    return element;
  }

  detach(track: MediaStreamTrack): void {
    let elementId = `audio-${this.patp}`;
    if (track.kind === TrackKind.Video) {
      elementId = `video-${this.patp}`;
      this.isVideoAttached = false;
    } else {
      this.isAudioAttached = false;
    }
    const element: HTMLMediaElement | null = document.getElementById(
      elementId
    ) as HTMLMediaElement;
    // console.log('detaching', element);
    if (element) {
      detachTrack(track, element);
    }
  }

  getMediaElement(kind: TrackKind): HTMLMediaElement {
    let elementType = 'audio';
    let element: HTMLMediaElement;
    if (kind === TrackKind.Video) {
      elementType = 'video';
      const elementId = `video-${this.patp}`;
      element = document.getElementById(elementId) as HTMLVideoElement;
      if (!element) {
        // if the element doesn't exist, create it
        element = document.createElement(elementType) as HTMLVideoElement;
        element.id = elementId;
      }
      element.autoplay = true;
    } else {
      const elementId = `audio-${this.patp}`;
      element = document.getElementById(elementId) as HTMLVideoElement;
      if (!element) {
        // if the element doesn't exist, create it
        element = document.createElement(elementType) as HTMLAudioElement;
        element.id = `audio-${this.patp}`;
      }
    }
    return element;
  }
}

const dialPeer = (
  rid: string,
  from: string,
  to: string,
  rtc: any
): RemotePeer => {
  if (!local) {
    throw new Error('No local peer created');
  }

  const peerConfig = {
    isInitiator: isDialer(from, to),
    rtc,
  };

  const remotePeer = new RemotePeer(rid, to, peerConfig);

  peers.set(remotePeer.patp, remotePeer);
  console.log(remotePeer);
  remotePeer.dial();

  return remotePeer;
};

const dialAll = (
  our: string,
  room: RoomMobx,
  rtc: any
): Map<string, RemotePeer> => {
  const presentPeers = room.present.filter((peer: string) => our !== peer);
  presentPeers.forEach((peer: string) => {
    // console.log('dialing peer', peer, rtc);
    dialPeer(room.rid, our, peer, rtc);
  });

  return peers;
};

const hangup = (peer: string) => {
  const remotePeer = peers.get(peer);
  if (remotePeer) {
    remotePeer.hangup();
    peers.delete(peer);
  }
};

const hangupAll = () => {
  peers.forEach((peer) => {
    hangup(peer.patp);
  });
  peers.clear();
  local?.disableMedia();
};

export const RoomsStore = types
  .model('RoomsStore', {
    path: types.optional(types.string, ''),
    provider: types.optional(types.string, ''),
    rooms: types.map(RoomModel),
    chat: types.array(ChatModel),
    current: types.maybe(types.reference(RoomModel)),
    config: types.optional(types.frozen(), {
      rtc: {
        iceServers: [
          {
            username: 'realm',
            credential: 'zQzjNHC34Y8RqdLW',
            urls: 'turn:coturn.holium.live:3478?transport=tcp',
          },
          {
            username: 'realm',
            credential: 'zQzjNHC34Y8RqdLW',
            urls: 'turn:coturn.holium.live:3478?transport=udp',
          },
        ],
      },
    }),
  })
  .views((self) => ({
    getSpaceRooms(path: string) {
      return Array.from(self.rooms.values()).filter(
        (room) => room.path === path
      );
    },
    getPeer(patp: string) {
      if (patp === window.ship) return local;
      return peers.get(patp);
    },
    get peers() {
      return Array.from(peers.keys() || []);
    },
    get roomsList() {
      return Array.from(self.rooms.values());
    },
    get isMuted() {
      return local?.isMuted;
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      // self.rooms.clear();
      // self.chat.clear();
      // self.current = undefined;
      // Doing this all in one place
      local = observable(
        new LocalPeer(window.ship, {
          isHost: false,
          rtc: self.config.rtc,
        })
      );
      local.on(PeerEvent.AudioTrackAdded, () => {
        peers.forEach((peer: RemotePeer) => {
          if (!local) return;
          console.log('AudioTrackAdded - streaming tracks to', peer.patp);
          local?.stream?.getTracks().forEach((track: MediaStreamTrack) => {
            if (local?.isMuted && track.kind === TrackKind.Audio) {
              track.enabled = false;
            }
            if (!peer.spInstance?.destroyed) {
              // console.log(`%streaming tracks to ${peer.patp}`);
              if (local && local.stream) {
                peer.spInstance?.addTrack(track, local.stream);
              } else {
                console.error('streamTracks: local stream is null');
              }
            }
          });
        });
      });
      local?.on(PeerEvent.Muted, () => {
        sendData({
          kind: DataPacket_Kind.MUTE_STATUS,
          value: { data: true },
        });
      });
      local.on(PeerEvent.Unmuted, () => {
        sendData({
          kind: DataPacket_Kind.MUTE_STATUS,
          value: { data: false },
        });
      });
      local.on(PeerEvent.IsSpeakingChanged, (speaking: boolean) => {
        sendData({
          kind: DataPacket_Kind.SPEAKING_CHANGED,
          value: { data: speaking },
        });
      });
      const session = yield RoomsIPC.getSession();
      if (session) {
        self.provider = session.provider;
        self.rooms = session.rooms;
        if (session.current) {
          self.current = self.rooms.get(session.current);
          // local.enableMedia();
          // self.current && dialAll(window.ship, self.current, self.config.rtc);
        }
      }
    }),
    createRoom: flow(function* (
      title: string,
      access: 'public' | 'private',
      spacePath?: string | null
    ) {
      if (!local) return;
      try {
        const newRoom = RoomModel.create({
          rid: ridFromTitle(self.provider, window.ship, title),
          title,
          access,
          provider: self.provider,
          creator: window.ship,
          present: [window.ship],
          whitelist: [],
          capacity: 6,
          path: spacePath || '',
        });
        SoundActions.playRoomEnter();
        local.enableMedia();
        self.rooms.set(newRoom.rid, cast(newRoom));
        self.current = self.rooms.get(newRoom.rid);
        yield RoomsIPC.createRoom(
          newRoom.rid,
          newRoom.title,
          newRoom.access as 'public' | 'private',
          newRoom.path
        );
      } catch (e) {
        console.error(e);
      }
    }),
    joinRoom: flow(function* (rid: string) {
      const room = self.rooms.get(rid);
      if (room) {
        SoundActions.playRoomEnter();
        self.current = room;
        yield RoomsIPC.enterRoom(rid);
        local?.enableMedia();
        dialAll(window.ship, room, self.config.rtc);
      } else {
        console.error('Room not found');
      }
    }),
    leaveRoom: flow(function* () {
      if (!self.current) return;
      try {
        const currentRid = self.current.rid;
        self.current.removePeer(window.ship);
        self.current = undefined;
        yield RoomsIPC.leaveRoom(currentRid);
        hangupAll();
        SoundActions.playRoomLeave();
        peers.clear();
      } catch (e) {
        console.error(e);
      }
    }),
    deleteRoom: flow(function* (rid: string) {
      const room = self.rooms.get(rid);
      if (room) {
        self.current = undefined;
        self.rooms.delete(rid);
        yield RoomsIPC.deleteRoom(rid);
        hangupAll();
        SoundActions.playRoomLeave();
      } else {
        console.error('Room not found');
      }
    }),
    // Peer handling
    retryPeer(patp: string) {
      // protocol.retry(patp);
    },
    kickPeer: flow(function* (patp: string) {
      if (!self.current) return;
      yield RoomsIPC.kickPeer(self.current.rid, patp);
    }),
    // Local handling
    mute() {
      local?.mute();
    },
    unmute() {
      local?.unmute();
    },
    setAudioInput(deviceId: string) {
      local?.setAudioInputDevice(deviceId);
    },
    _onSession(session: any) {
      self.provider = session.provider;
      self.rooms = session.rooms;
      if (session.current) {
        self.current = self.rooms.get(session.current);
        // local?.enableMedia();
        // self.current && dialAll(window.ship, self.current, self.config.rtc);
      }
    },
    _onRoomCreated(room: RoomMobx) {
      self.rooms.set(room.rid, cast(room));
    },

    _onRoomEntered(rid: string, patp: string) {
      const room = self.rooms.get(rid);
      if (patp === window.ship && self.current?.rid !== rid) {
        self.current = room;
      }
      room?.addPeer(patp);
      if (self.current?.rid === rid) {
        // if we are in the room, dial the new peer
        if (peers.has(patp)) {
          console.log('!!!!!already have peer', patp);
        }
        if (patp !== window.ship) {
          const remotePeer = dialPeer(rid, window.ship, patp, self.config.rtc);
          // queuedPeers are peers that are ready for us to dial them
          if (queuedPeers.includes(patp)) {
            // console.log('%room-entered in queuedPeer', patp);
            remotePeer.onWaiting();
            queuedPeers.splice(queuedPeers.indexOf(patp), 1);
          }
        } else {
          // this.emit(ProtocolEvent.RoomEntered, room);
          // this.transitions.entering = null;
        }
      }
    },
    _onRoomLeft(rid: string, patp: string) {
      const room = self.rooms.get(rid);
      if (patp === window.ship && self.current?.rid === rid) {
        self.current = undefined;
        // hangupAll();
      }
      if (patp !== window.ship) {
        room?.removePeer(patp);
        hangup(patp);
      }
    },
    _onKicked(rid: string, patp: string) {
      const room = self.rooms.get(rid);
      if (patp === window.ship && self.current?.rid === rid) {
        self.current = undefined;
        hangupAll();
      }
      if (patp !== window.ship) {
        room?.removePeer(patp);
        hangup(patp);
      }
    },
    _onRoomDeleted(rid: string) {
      if (self.current?.rid === rid) {
        self.current = undefined;
      }
      const room = self.rooms.get(rid);
      // console.log('_onRoomDeleted', room?.creator, window.ship);
      if (room?.creator !== window.ship) {
        // console.log('_onRoomDeleted someone else deleted');
        peers.forEach((peer) => {
          hangup(peer.patp);
        });
        peers.clear();
      }
      self.rooms.delete(rid);
    },
  }));

export type RoomsMobxType = Instance<typeof RoomsStore>;

let areListenersRegistered = false;
function registerOnUpdateListener() {
  if (areListenersRegistered) {
    console.log('onUpdate listener already registered.');
    return;
  }

  RoomsIPC.onUpdate(({ mark, type, payload }) => {
    if (mark === 'rooms-v2-view') {
      // console.log('rooms-v2-view', type, payload);
      if (type === 'session') {
        shipStore.roomsStore._onSession(payload);
      }
    }

    if (mark === 'rooms-v2-reaction') {
      // console.log('rooms-v2-reaction', type, payload);
      if (type === 'room-entered') {
        SoundActions.playRoomPeerEnter();
        console.log(`%room-entered ${payload.ship}`);
        shipStore.roomsStore._onRoomEntered(payload.rid, payload.ship);
      }
      if (type === 'room-left') {
        console.log(`%room-left ${payload.ship}`);
        shipStore.roomsStore._onRoomLeft(payload.rid, payload.ship);
      }
      if (type === 'room-created') {
        shipStore.roomsStore._onRoomCreated(payload.room);
      }
      if (type === 'room-deleted') {
        shipStore.roomsStore._onRoomDeleted(payload.rid);
      }
      if (type === 'kicked') {
        shipStore.roomsStore._onKicked(payload.rid, payload.ship);
        // SoundActions.playRoomPeerEnter();
      }
      if (type === 'chat-received') {
        // SoundActions.playRoomPeerEnter();
      }
      if (type === 'provider-changed') {
        // SoundActions.playRoomPeerLeave();
      }
    }
    if (mark === 'rooms-v2-signal') {
      const remotePeer = peers.get(payload.from);
      const signalData = JSON.parse(payload.data);
      // console.log('rooms-v2-signal', payload.from, signalData.type);

      if (signalData.type === 'waiting') {
        if (!remotePeer) {
          console.log(`%waiting from unknown ${payload.from}`);
          queuedPeers.push(payload.from);
        } else {
          console.log(`%waiting from ${payload.from}`);
          remotePeer.onWaiting();
        }
      }
      if (signalData.type === 'retry') {
        const retryingPeer = peers.get(payload.from);
        retryingPeer?.dial();
      }
      if (!['retry', 'ack-waiting', 'waiting'].includes(signalData.type)) {
        if (remotePeer) {
          console.log(
            `%${JSON.parse(payload.data)?.type} from ${payload.from}`
          );
          remotePeer.peerSignal(payload.data);
        } else {
          console.log(
            `%${JSON.parse(payload.data)?.type} from unknown ${payload.from}`
          );
        }
      }
    }
  });

  window.addEventListener('beforeunload', () => {
    console.log('rooms store cleanup');
    // local?.disableMedia();
    // peers.forEach((peer) => {
    //   peer.removeAudioTracks();
    // });
    // local = null;
  });

  areListenersRegistered = true;
}

registerOnUpdateListener();
