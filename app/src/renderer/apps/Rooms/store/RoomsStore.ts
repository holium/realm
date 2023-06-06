import { patp2dec } from '@urbit/aura';
import { action, makeObservable, observable } from 'mobx';
import Peer, { Instance as PeerInstance } from 'simple-peer';

import { SoundActions } from 'renderer/lib/sound';
import { RealmIPC } from 'renderer/stores/ipc';

import { LocalPeer } from './LocalPeer';
import { DataPacket } from './room.types';
import { IAudioAnalyser, SpeakingDetectionAnalyser } from './SpeakingDetector';

type RoomAccess = 'public' | 'private';
type RoomCreateType = {
  rid: string;
  provider: string;
  creator: string;
  access?: RoomAccess;
  title: string;
  whitelist?: string[];
  capacity?: number;
  path: string | null;
};

export const providerFromRid = (rid: string) => {
  return rid.split('/')[0];
};

export const ridFromTitle = (provider: string, our: string, title: string) => {
  const slugified = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-');
  return `${provider}/rooms/${our}/${slugified}`;
};

const serialize = (data: any) => {
  return JSON.stringify(data);
};

const unserialize = (data: string) => {
  try {
    return JSON.parse(data.toString());
  } catch (e) {
    return undefined;
  }
};

const isInitiator = (from: string, to: string) => {
  return patp2dec(from) > patp2dec(to);
};

export type RoomChat = {
  index: number;
  author: string;
  contents: string;
  isRightAligned: boolean;
  timeReceived: number;
};

export class RoomModel {
  @observable rid: string;
  @observable provider = '';
  @observable creator = '';
  @observable access: RoomAccess = 'public';
  @observable title = '';
  @observable present: string[] = [];
  @observable whitelist: string[] = [];
  @observable capacity = 10;
  @observable path: string | null = null;

  constructor(initialData: RoomCreateType) {
    makeObservable(this);
    this.rid = initialData.rid;
    this.provider = initialData.provider;
    this.creator = initialData.creator;
    this.access = initialData.access || 'public';
    this.title = initialData.title;
    Object.assign(this, initialData);
    this.whitelist = initialData.whitelist || [];
    if (initialData.capacity) {
      this.capacity = initialData.capacity;
    }
    this.path = initialData.path || null;
  }

  @action
  update(data: RoomModel) {
    this.access = data.access || 'public';
    this.title = data.title;
    this.whitelist = data.whitelist || [];
    this.present = data.present || [];
    if (data.capacity) {
      this.capacity = data.capacity;
    }
    this.path = data.path || null;
  }

  @action
  addPeer(patp: string) {
    this.present.push(patp);
  }

  @action
  removePeer(patp: string) {
    this.present = this.present.filter((p) => p !== patp);
  }

  @action
  addWhitelist(patp: string) {
    this.whitelist.push(patp);
  }

  @action
  removeWhitelist(patp: string) {
    this.whitelist = this.whitelist.filter((p) => p !== patp);
  }
}

export class RoomsStore {
  @observable ourId: string;
  @observable ourPeer: LocalPeer;
  @observable path = '';
  @observable provider = 'node-0.holium.live';
  @observable rooms: Map<string, RoomModel> = observable.map<
    string,
    RoomModel
  >();
  @observable chat: RoomChat[] = [];
  @observable currentRid: string | null = null;
  @observable isMuted = false;
  @observable isSpeaking = false;
  @observable isAudioAttached = false;
  @observable peersMetadata = observable.map();
  @observable status = 'disconnected';
  @observable peers: Map<string, PeerClass> = observable.map();
  @observable websocket: WebSocket;
  @observable reconnectTimer: NodeJS.Timeout | null = null;
  @observable rtcConfig = {
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
  };

  constructor(ourId: string, provider?: string) {
    makeObservable(this);
    this.ourId = ourId;
    if (provider) {
      this.provider = provider;
    }
    this.ourPeer = new LocalPeer(this.ourId);
    this.websocket = this.connect();
    this.onRoomEvent = this.onRoomEvent.bind(this);
    this.createPeer = this.createPeer.bind(this);

    // handles various connectivity events
    window.addEventListener('offline', () => {
      this.status = 'offline';
      this.hangupAllPeers();
      this.websocket.close();
    });

    window.addEventListener('online', () => {
      this.status = 'disconnected';
      this.websocket = this.connect();
    });

    RealmIPC.onUpdate((update) => {
      if (update.type === 'logout') {
        this.cleanUpCurrentRoom();
        this.status = 'disconnected';
        this.websocket.close();
      }
    });
  }

  get currentRoom() {
    if (!this.currentRid) {
      return null;
    }
    const room = this.rooms.get(this.currentRid);
    if (!room) {
      return null;
    }
    return room;
  }

  get currentRoomPeers() {
    if (!this.currentRid) {
      return [];
    }
    const room = this.rooms.get(this.currentRid);
    return (
      room?.present.filter((peerId: string) => peerId !== this.ourId) || []
    );
  }

  get currentRoomPresent() {
    if (!this.currentRid) {
      return [];
    }
    const room = this.rooms.get(this.currentRid);
    return room?.present || [];
  }

  get roomsList() {
    return Array.from(this.rooms.values());
  }

  get providerString() {
    // parse our root of domain
    const domain = this.provider.split('.')[0];
    // parse our node number
    return domain;
  }

  getSpaceRooms(space: string) {
    return Array.from(this.rooms.values()).filter(
      (room) => room.path === space
    );
  }

  @action
  async toggleVideo(enableVideo: boolean) {
    if (!enableVideo) {
      await this.ourPeer.disableVideo();
    } else {
      const stream = await this.ourPeer.enableVideo();
      this.peers.forEach((peer) => {
        if (stream) {
          peer.peer.addStream(stream);
        }
      });
    }
  }

  @action
  setProvider(provider: string) {
    this.provider = provider;
    this.websocket = this.connect();
  }

  @action
  setCurrentRoom(rid: string) {
    this.currentRid = rid;
  }

  @action
  reconnect(delay: number, backoff: number) {
    // add backoff factor to delay
    delay = delay * backoff;
    // if delay is greater than 30 seconds, cap it at 30 seconds
    if (delay > 30000) {
      delay = 30000;
    }
    // try to reconnect after delay
    // only let one timer run at a time
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.websocket = this.connect();
        this.reconnectTimer = null;
      }, delay);
    }
  }

  @action
  connect() {
    const websocket = new WebSocket(
      `wss://${this.provider}/signaling?serverId=${this.ourId}`
    );

    websocket.onopen = () => {
      console.log('websocket connected');
      if (this.currentRoom && this.status === 'connected') {
        this.ourPeer.enableMedia(this.ourPeer.constraints);
        console.log(
          'websocket onopen reconnecting to room',
          this.currentRoom.rid
        );
        // reconnect to current room if you were in one and
        // the websocket disconnected
        const peers = this.currentRoom.present.filter(
          (peer: string) => peer !== this.ourId
        );
        peers.forEach((peerId: string) => {
          if (!this.ourPeer.stream) {
            console.error('no local stream');
            return;
          }
          if (this.peers.get(peerId)?.peer.destroyed) {
            console.log(
              'peer was destroyed, connection closed, reconnecting',
              peerId
            );
            this.destroyPeer(peerId);
            this.createPeer(peerId);
            return;
          }
        });
      }
      this.status = 'connected';
      websocket.send(serialize({ type: 'connect' }));
    };

    websocket.onmessage = this.onMessage.bind(this);

    websocket.onclose = () => {
      console.log('websocket closed', this.status);
      if (this.status !== 'disconnected') {
        this.reconnect(5000, 1.5);
      }
    };

    websocket.onerror = (err) => {
      console.error('Error occurred:', err);
      this.status = 'error';
      websocket.close();
    };

    const disconnect = () => {
      this.status = 'disconnected';
      console.log('disconnecting websocket');
      websocket.send(serialize({ type: 'disconnect' }));
      websocket.close();
    };

    window.onclose = () => {
      disconnect();
    };
    // on sigkill close the connection
    window.onbeforeunload = () => {
      disconnect();
    };
    return websocket;
  }

  // ------------------ WS EVENT HANDLERS ------------------ //
  onMessage = (message: any) => {
    const parsedMessage = unserialize(message.data);
    this.onRoomEvent(parsedMessage);
  };

  @action
  onRoomEvent(event: any) {
    switch (event.type) {
      case 'rooms':
        this.rooms = observable.map(
          event.rooms.reduce((acc: any, room: any) => {
            if (this.rooms.has(room.rid)) {
              const updatedRoom = this.rooms.get(room.rid);

              updatedRoom?.update(room);
              acc[room.rid] = updatedRoom;
              return acc;
            } else {
              const newRoom = new RoomModel(room);
              newRoom.update(room);
              acc[room.rid] = newRoom;
              return acc;
            }
          }, {})
        );

        break;
      case 'room-created':
        console.log('room created', event);
        // eslint-disable-next-line no-case-declarations
        const newRoom = new RoomModel(event.room);
        newRoom.update(event.room);
        this.rooms.set(event.room.rid, newRoom);

        this.currentRid = event.room.rid;
        break;
      case 'room-entered':
        console.log('room entered', event);
        if (this.rooms.has(event.room.rid)) {
          this.rooms.get(event.room.rid)?.update(event.room);
        }
        if (event.room.rid === this.currentRid) {
          // if we entered a room, we need to create a peer for each user in the room
          if (event.peer_id === this.ourId) {
            const peers = event.room.present.filter(
              (peer: string) => peer !== this.ourId
            );
            peers.forEach((peerId: string) => {
              if (!this.ourPeer.stream) {
                console.error('no local stream');
                return;
              }
              if (this.peers.get(peerId)) {
                console.log('already have peer', peerId);
                return;
              }
              this.createPeer(peerId);
            });
          } else {
            // someone else entered the room
            console.log('someone entered the room', event);
            this.createPeer(event.peer_id);

            SoundActions.playRoomPeerEnter();
          }
        }
        break;
      case 'room-left':
        // replace room in rooms array with event.room
        console.log('room left', event);
        if (this.rooms.has(event.room.rid)) {
          this.rooms.get(event.room.rid)?.update(event.room);
        }
        if (this.currentRid === event.room.rid) {
          if (event.peer_id === this.ourId) {
            this.currentRid = null;
            this.hangupAllPeers();
          } else {
            // someone left the room
            SoundActions.playRoomPeerLeave();
            console.log('someone left the room', event);
            this.destroyPeer(event.peer_id);
            this.rooms.get(event.rid)?.removePeer(event.peer_id);

            // this.rooms.get(event.rid)?.present.splice(
            // self.rooms = self.rooms.map((room: any) =>
            //   room.rid === event.rid ? updatedRoom : room
            // );
            this.currentRid = event.rid;
          }
        }
        break;
      case 'room-deleted':
        if (this.currentRid && this.currentRid === event.rid) {
          this.rooms.get(this.currentRid)?.present.forEach((peerId: string) => {
            if (peerId !== this.ourId) this.destroyPeer(peerId);
          });
          this.currentRid = null;
        }
        this._removeRoom(event.rid);
        break;
      case 'signal':
        if (this.currentRid === event.rid) {
          if (!this.ourPeer.stream) {
            console.error('no local stream');
            return;
          }

          let peer = this.peers.get(event.from) || this.createPeer(event.rid);
          if (peer?.peer.destroyed) {
            console.log(
              'peer was destroyed, but is attempting to reconnect',
              event.from
            );
            this.destroyPeer(event.from);
            peer = this.createPeer(event.from);
            return;
          }
          if (!peer) {
            console.log('on signal - no peer found');
            return;
          }
          peer.onReceivedSignal(event.signal);
        }
        break;
      case 'chat':
        if (this.currentRid === event.rid && event.peer_id !== this.ourId) {
          console.log('chat', event);
          this.chat.push({
            author: event.peer_id,
            contents: event.message,
            timeReceived: new Date().getTime(),
            isRightAligned: event.from === this.ourId,
            index: this.chat.length,
          });
        }
        break;
    }
  }

  @action
  createRoom(title: string, access: RoomAccess, path: string | null) {
    // await SoundActions.playRoomEnter();
    this.ourPeer.enableMedia(this.ourPeer.constraints);
    const newRoom = {
      rid: ridFromTitle(this.provider, this.ourId, title),
      provider: this.provider,
      creator: this.ourId,
      access,
      title,
      path,
    };
    this.rooms.set(newRoom.rid, new RoomModel(newRoom));
    this.websocket.send(
      serialize({
        type: 'create-room',
        rid: ridFromTitle(this.provider, this.ourId, title),
        title: title,
        path,
      })
    );
  }

  @action
  editRoom(title: string, path: string) {
    console.log('edit room', title, path);
    // const newRoom = {
    //   rid: ridFromTitle(this.provider, this.ourId, title),
    //   provider: this.provider,
    //   creator: this.ourId,
    //   title,
    //   path,
    // };
    // this.rooms.set(newRoom.rid, new RoomModel(newRoom));
    // this.websocket.send(
    //   serialize({
    //     type: 'create-room',
    //     rid: ridFromTitle(this.provider, this.ourId, title),
    //     title: title,
    //     path,
    //   })
    // );
  }

  @action
  deleteRoom(rid: string) {
    SoundActions.playRoomLeave();
    this.rooms.delete(rid);
    this.ourPeer.disableMedia();
    this.currentRid = null;
    this.websocket.send(
      serialize({
        type: 'delete-room',
        rid,
      })
    );
    this.hangupAllPeers();
  }

  @action
  cleanUpCurrentRoom() {
    if (this.currentRoom) {
      if (this.currentRoom.creator === this.ourId) {
        this.deleteRoom(this.currentRoom.rid);
      } else {
        this.leaveRoom(this.currentRoom.rid);
      }
    }
  }

  @action
  joinRoom(rid: string) {
    this.cleanUpCurrentRoom();
    this.ourPeer.enableMedia(this.ourPeer.constraints).then(
      action(() => {
        this.setCurrentRoom(rid);
        this.websocket.send(
          serialize({
            type: 'enter-room',
            rid,
          })
        );
        // add us to the room
        this.rooms.get(rid)?.addPeer(this.ourId);
      })
    );
    // enter room will trigger room-entered event
  }

  @action
  leaveRoom(rid: string) {
    SoundActions.playRoomLeave();
    this.rooms.get(rid)?.removePeer(this.ourId);
    this.currentRid = null;
    this.ourPeer.disableMedia();
    this.websocket.send(
      serialize({
        type: 'leave-room',
        rid,
      })
    );
    this.hangupAllPeers();
  }

  @action
  sendChat(rid: string, message: string) {
    this.chat.push({
      index: this.chat.length,
      author: this.ourId,
      contents: message,
      timeReceived: Date.now(),
      isRightAligned: true,
    });
    this.websocket.send(
      serialize({
        type: 'send-chat',
        rid,
        message,
      })
    );
  }

  @action
  createPeer(peerId: string) {
    if (!this.currentRid) {
      console.warn('No current room');
      return;
    }
    if (!this.ourPeer.stream) {
      console.error('no local stream');
      // TODO handle this better
      return;
    }
    console.log('creating peer', peerId);
    const peer = new PeerClass(
      this.currentRid,
      this.ourId,
      peerId,
      isInitiator(this.ourId, peerId),
      this.ourPeer.stream,
      this.websocket
    );
    this.peers.set(peerId, peer);
    return peer;
  }

  @action
  retryPeer(peerId: string) {
    this.peers.get(peerId)?.retry();
  }

  @action
  kickPeer(peerId: string) {
    // remove peer from room by sending kick signal
    this.websocket.send(
      serialize({
        type: 'kick',
        rid: this.currentRid,
        peer_id: peerId,
      })
    );
    // destroy peer
    this.peers.get(peerId)?.destroy();
  }

  @action
  destroyPeer(peerId: string) {
    this.peers.get(peerId)?.destroy();
    this.peers.delete(peerId);
  }

  @action
  hangupAllPeers() {
    this.peers.forEach((peer) => {
      peer.destroy();
    });
    this.peers.clear();
  }

  // Signal peer
  @action
  onPeerSignal(from: string, data: any) {
    const peer = this.peers.get(from);
    if (peer) {
      peer.onSignal(data);
    }
  }

  @action
  sendDataToRoom(data: Partial<DataPacket>) {
    const payload = { from: this.ourId, ...data } as DataPacket;
    this.peers.forEach((peer) => {
      peer.sendData(payload);
    });
  }

  @action
  _setRoom(room: RoomModel) {
    this.rooms.set(room.rid, new RoomModel(room));
  }

  @action
  _removeRoom(rid: string) {
    this.rooms.delete(rid);
  }
}

export class PeerClass {
  @observable rid: string;
  @observable ourId: string;
  @observable peerId: string;
  @observable peer: PeerInstance;
  @observable websocket: WebSocket;
  @observable hasVideo = false;
  @observable isMuted = false;
  @observable isSpeaking = false;
  @observable isAudioAttached = false;
  @observable status = 'disconnected';
  @observable analysers: IAudioAnalyser[] = [];
  @observable audioTracks: Map<string, any> = new Map();
  @observable audioStream: MediaStream | null = null;
  @observable videoStream: MediaStream | null = null;
  @observable videoTracks: Map<string, any> = new Map();
  @observable stream: MediaStream | null = null;

  constructor(
    rid: string,
    ourId: string,
    peerId: string,
    initiator: boolean,
    stream: MediaStream,
    websocket: WebSocket
  ) {
    makeObservable(this);
    this.rid = rid;
    this.websocket = websocket;
    this.peerId = peerId;

    this.ourId = ourId;
    this.peer = this.createPeer(peerId, initiator, stream);
  }

  @action
  isSpeakingChanged(isSpeaking: boolean) {
    this.isSpeaking = isSpeaking;
  }

  @action
  isMutedChanged(isMuted: boolean) {
    this.isMuted = isMuted;
  }

  @action
  isAudioAttachedChanged(isAudioAttached: boolean) {
    this.isAudioAttached = isAudioAttached;
  }

  @action
  hasVideoChanged(hasVideo: boolean) {
    this.hasVideo = hasVideo;
  }

  @action
  createPeer(peerId: string, initiator: boolean, stream: MediaStream) {
    this.status = 'connecting';
    const peer = new Peer({
      initiator: initiator,
      trickle: true,
      channelName: peerId,
      stream,
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
    if (track.kind === 'video') {
      console.log('got video track', track.id);
      // attach video track to video element
      if (this.videoTracks.has(track.id)) {
        console.log('already have this track');
        return;
      }
      this.videoTracks.set(track.id, track);
      this.stream = stream;
      this.hasVideoChanged(true);
      const video = document.getElementById(
        `peer-video-${this.peerId}`
      ) as HTMLVideoElement;

      track.onmute = () => {
        // triggered when video is stopped by peer
        track.stop();
        if (!video) return;
        video.style.display = 'none';
        this.hasVideoChanged(false);
      };

      if (video) {
        video.style.display = 'inline-block';
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
      } else {
        console.log('no video element found');
      }
    }
    if (track.kind === 'audio') {
      console.log('got audio track', track.id);
      if (this.audioTracks.size > 0) {
        console.log('already have this track');
        return;
      }
      this.audioTracks.set(track.id, track);
      this.audioStream = stream;
      this.isAudioAttachedChanged(true);
      this.stream = stream;

      track.onmute = () => {
        console.log('track muted');
        this.isMutedChanged(true);
        document
          .getElementById(`peer-audio-${this.peerId}`)
          ?.setAttribute('muted', 'true');
      };

      track.onunmute = () => {
        console.log('track unmuted');
        this.isMutedChanged(false);
        document
          .getElementById(`peer-audio-${this.peerId}`)
          ?.setAttribute('muted', 'false');
      };

      track.onended = () => {
        console.log('track ended');
        this.isAudioAttachedChanged(false);
      };

      this.analysers[0] = SpeakingDetectionAnalyser.initialize(this);
      // create an audio element for the stream
      const audio = document.createElement('audio');
      audio.id = `peer-audio-${this.peerId}`;
      audio.srcObject = stream;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
  }

  @action
  onError(err: any) {
    console.error('peer error', err);
  }

  @action
  onClose() {
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
    const msg = {
      type: 'signal',
      rid: this.rid,
      signal,
      to: this.peerId,
      from: this.ourId,
    };
    this.websocket.send(serialize(msg));
  }

  @action
  onStream(_stream: MediaStream) {
    // if (this.status !== 'connected') return;
    // this.peer.addStream(stream);
    // // create an audio element for the stream
    // const audio = document.createElement('audio');
    // audio.id = `peer-audio-${this.peerId}`;
    // audio.srcObject = stream;
    // audio.autoplay = true;
    // document.body.appendChild(audio);
    // audio.playsInline = true;
    // document.getElementById(`peer-video-${peerId}`).srcObject = stream
    // document.getElementById(`peer-video-${peerId}`).srcObject = stream;
    // setPeerState(peerId, peer);
  }

  @action
  onData(data: any) {
    console.log('Data from peer', this.peerId, unserialize(data));
  }

  @action
  onConnect() {
    this.status = 'connected';
    console.log('Peer connected', this.peerId);
    this.peer.send(
      serialize({
        type: 'peer-message',
        msg: 'hey man!',
      })
    );
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
  retry() {
    this.peer.destroy();
    this.peer = this.createPeer(this.peerId, false, this.peer.streams[0]);
  }

  @action
  destroy() {
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
