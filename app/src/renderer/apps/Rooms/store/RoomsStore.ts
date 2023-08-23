import { patp2dec } from '@urbit/aura';
import EventsEmitter from 'events';
import { action, makeObservable, observable } from 'mobx';

import { SoundActions } from 'renderer/lib/sound';
import { RealmIPC } from 'renderer/stores/ipc';
import { shipStore } from 'renderer/stores/ship.store';

import { serialize, unserialize } from './helpers';
import { LocalPeer } from './LocalPeer';
import { PeerClass } from './Peer';
import { DataPacket, DataPacketKind } from './room.types';

type RoomAccess = 'public' | 'private';
export enum RoomType {
  background = 'background',
  media = 'media',
}
type RoomCreateType = {
  rid: string;
  rtype: RoomType;
  provider: string;
  creator: string;
  access?: RoomAccess;
  title: string;
  whitelist?: string[];
  capacity?: number;
  path: string;
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

const isInitiator = (from: string, to: string) => {
  return patp2dec(from) > patp2dec(to);
};

export type OnDataChannel = (
  rid: string,
  peer: string,
  data: DataPacket
) => Promise<void>;

export type OnLeftRoom = (rid: string, peer: string) => void;

export type RoomChat = {
  index: number;
  author: string;
  contents: string;
  isRightAligned: boolean;
  timeReceived: number;
};

export class RoomModel {
  @observable rid: string;
  @observable rtype: RoomType = RoomType.media;
  @observable provider = '';
  @observable creator = '';
  @observable access: RoomAccess = 'public';
  @observable title = '';
  @observable present: string[] = [];
  @observable whitelist: string[] = [];
  @observable capacity = 10;
  @observable path: string;

  constructor(initialData: RoomCreateType) {
    makeObservable(this);
    this.rid = initialData.rid;
    this.rtype = initialData.rtype;
    this.provider = initialData.provider;
    this.creator = initialData.creator;
    this.access = initialData.access || 'public';
    this.title = initialData.title;
    Object.assign(this, initialData);
    this.whitelist = initialData.whitelist || [];
    if (initialData.capacity) {
      this.capacity = initialData.capacity;
    }
    this.path = initialData.path;
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
    this.path = data.path;
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

type SpeakingSession = {
  start: number;
  end?: number;
  duration?: number;
};

type ActiveSpeaker = {
  isSpeaking: boolean;
  currentSession: SpeakingSession | null;
  sessions: SpeakingSession[];
};
export class RoomsStore extends EventsEmitter {
  @observable ourId: string;
  @observable ourPeer: LocalPeer;
  @observable path = '';
  // @observable provider = 'litzod-dozzod-hostyv.holium.live';
  // @observable provider = 'node-test.holium.live';
  @observable provider = 'localhost:3030';
  @observable rooms: Map<string, RoomModel> = observable.map<
    string,
    RoomModel
  >();
  @observable chat: RoomChat[] = [];
  @observable currentRid: string | null = null;
  @observable isMuted = false;
  @observable isSpeaking = false;
  @observable isAudioAttached = false;
  @observable status = 'disconnected';
  @observable peers: Map<string, PeerClass> = observable.map();
  @observable speakers: Map<string, ActiveSpeaker> = observable.map();
  @observable websocket: WebSocket;
  @observable reconnectTimer: NodeJS.Timeout | null = null;
  @observable pinnedSpeaker: string | null = null;
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
  @observable onDataChannel: OnDataChannel = async () => {};
  @observable onLeftRoom: OnLeftRoom = async () => {};

  constructor(ourId: string, provider?: string) {
    super();
    makeObservable(this);
    this.ourId = ourId;
    if (provider) {
      this.provider = provider;
    }
    this.ourPeer = new LocalPeer(this.ourId);

    this.ourPeer.on('isSpeakingChanged', (isSpeaking) => {
      this.updateActiveSpeaker(this.ourId, isSpeaking);
    });

    this.ourPeer.on('isMutedChanged', (isMuted) => {
      this.sendDataToRoom({
        kind: DataPacketKind.MUTE_STATUS,
        value: {
          data: isMuted,
        },
      });
    });

    this.ourPeer.on('screenSharingStatusChanged', (isScreenSharing) => {
      if (isScreenSharing) {
        this.peers.forEach((peer) => {
          this.ourPeer.screenStream &&
            peer.setNewStream(this.ourPeer.screenStream);
        });
        this.sendDataToRoom({
          kind: DataPacketKind.SCREENSHARE_CHANGED,
          value: {
            data: true,
          },
        });
      } else {
        this.peers.forEach((peer) => {
          if (
            this.ourPeer.screenStream &&
            peer.peer.streams.includes(this.ourPeer.screenStream)
          ) {
            peer.peer.removeStream(this.ourPeer.screenStream);
          }
        });
        this.sendDataToRoom({
          kind: DataPacketKind.SCREENSHARE_CHANGED,
          value: {
            data: false,
          },
        });
      }
    });

    this.websocket = this.connect();
    this.onRoomEvent = this.onRoomEvent.bind(this);
    this.createPeer = this.createPeer.bind(this);
    this.pinSpeaker = this.pinSpeaker.bind(this);

    // handles various connectivity events
    window.addEventListener('offline', () => {
      this.status = 'offline';
      this.rooms.forEach((room) => {
        this.hangupAllPeers(room.rid);
      });
      this.websocket.close();
    });

    window.addEventListener('online', () => {
      this.status = 'disconnected';
      this.websocket = this.connect();
    });

    RealmIPC.onUpdate((update) => {
      if (update.type === 'logout') {
        this.rooms.forEach((room) => {
          this.leaveRoom(room.rid);
        });
        this.status = 'disconnected';
        this.websocket.close();
      }
    });
  }

  @action
  registerListeners({
    onDataChannel,
    onLeftRoom,
  }: {
    onDataChannel: OnDataChannel;
    onLeftRoom: OnLeftRoom;
  }) {
    this.onDataChannel = onDataChannel.bind(this);
    this.onLeftRoom = onLeftRoom.bind(this);
    this.kickPeer = this.kickPeer.bind(this);
    this.retryPeer = this.retryPeer.bind(this);
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
    return (
      room?.present.slice().sort((a, b) => {
        if (a === this.ourId) {
          return -1;
        }
        if (b === this.ourId) {
          return 1;
        }
        return 0;
      }) || []
    );
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

  getRoomByPath(path: string) {
    return Array.from(this.rooms.values()).find((room) => room.path === path);
  }

  getSpaceRooms(space: string) {
    return Array.from(this.rooms.values()).filter((room) =>
      room.path?.includes(space)
    );
  }

  getNumRooms(roomType: RoomType): number {
    let result = 0;
    for (const room of this.rooms.entries()) {
      if (room[1].rtype === roomType) result++;
    }
    return result;
  }

  @action
  pinSpeaker(speakerId: string) {
    if (speakerId === this.pinnedSpeaker) {
      this.pinnedSpeaker = null;
      return;
    }
    this.pinnedSpeaker = speakerId;
  }

  @action
  async toggleVideo(enableVideo: boolean) {
    if (!enableVideo) {
      this.peers.forEach((peer) => {
        if (
          this.ourPeer.videoStream &&
          peer.peer.streams.includes(this.ourPeer.videoStream)
        ) {
          peer.peer.removeStream(this.ourPeer.videoStream);
        }
      });
      this.ourPeer.disableVideo();
      this.sendDataToRoom({
        kind: DataPacketKind.WEBCAM_CHANGED,
        value: {
          data: false,
        },
      });
    } else {
      const stream = await this.ourPeer.enableVideo();
      this.peers.forEach((peer) => {
        if (stream) {
          peer.setNewStream(stream);
        }
      });
      this.sendDataToRoom({
        kind: DataPacketKind.WEBCAM_CHANGED,
        value: {
          data: true,
        },
      });
    }
  }

  @action
  async toggleScreenShare(enableScreenSharing: boolean) {
    if (!enableScreenSharing) {
      this.peers.forEach((peer) => {
        if (
          this.ourPeer.screenStream &&
          peer.peer.streams.includes(this.ourPeer.screenStream)
        ) {
          peer.peer.removeStream(this.ourPeer.screenStream);
        }
      });

      await this.ourPeer.disableScreenSharing();
    } else {
      await this.ourPeer.enableScreenSharing();
    }
  }

  @action
  setProvider(provider: string) {
    this.provider = provider;
    this.websocket = this.connect();
  }

  @action
  setAudioInput(deviceId: string) {
    this.ourPeer.setAudioInputDevice(deviceId);
  }

  @action
  setAudioOutput(deviceId: string) {
    this.ourPeer.setAudioOutputDevice(deviceId);
    // loop peers and set their audio output on their audio elements
    this.peers.forEach((peer) => {
      peer.setAudioOutputDevice(deviceId);
    });
  }

  @action
  setVideoInput(deviceId: string) {
    this.ourPeer.setVideoInputDevice(deviceId);
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
    const protocol =
      process.env.NODE_ENV === 'development' &&
      !(this.provider.indexOf('localhost') === -1)
        ? 'ws'
        : 'wss';
    const websocket = new WebSocket(
      `${protocol}://${this.provider}/signaling?serverId=${this.ourId}`
    );

    websocket.onopen = () => {
      console.log('websocket connected');
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

    // on computer sleep close the connection
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
        if (event.room.rtype === RoomType.media) {
          this.currentRid = event.room.rid;
        }
        break;
      case 'room-entered':
        {
          console.log('room entered', event);
          const room = this.rooms.get(event.room.rid);
          if (room) {
            room.update(event.room);
            // if (event.room.rid === this.currentRid) {
            // if we entered a room, we need to create a peer for each user in the room
            if (event.peer_id === this.ourId) {
              const peers = event.room.present.filter(
                (peer: string) => peer !== this.ourId
              );
              peers.forEach((peerId: string) => {
                if (
                  room.rtype === RoomType.media &&
                  !this.ourPeer.audioStream
                ) {
                  console.error('no local stream');
                  return;
                }
                const peer = this.peers.get(peerId);
                if (peer) {
                  peer.refCount++;
                  peer.rooms.set(room.rid, room);
                  console.log('already have peer', peerId);
                  return;
                }
                this.createPeer(room.rid, room.rtype, peerId);
              });
            } else {
              // someone else entered the room
              console.log('someone entered the room', event);
              this.createPeer(room.rid, room.rtype, event.peer_id);

              if (
                shipStore.settingsStore.systemSoundsEnabled &&
                room.rtype === RoomType.media
              ) {
                SoundActions.playRoomPeerEnter();
              }
            }
          }
        }
        break;
      case 'room-left':
        {
          // replace room in rooms array with event.room
          console.log('room left', event);
          const room = this.rooms.get(event.room.rid);
          if (room) {
            room.update(event.room);
            // if (this.currentRid === event.room.rid) {
            if (event.peer_id === this.ourId) {
              if (room.rtype === RoomType.media) {
                this.currentRid = null;
                // this already happens in leave/delete Room calls. since we are using
                //  peer reference counts to determine when to hangup, this extra call here
                //  is causing a bug
                // this.hangupAllPeers();
              }
            } else {
              if (
                shipStore.settingsStore.systemSoundsEnabled &&
                room.rtype === RoomType.media
              ) {
                SoundActions.playRoomPeerLeave();
              }
              console.log('someone left the room', event);
              this.destroyPeer(event.peer_id);
              room.removePeer(event.peer_id);

              if (event.room.rtype === RoomType.media) {
                this.currentRid = event.rid;
              }
            }
          }
        }
        break;
      case 'room-deleted':
        {
          const room = this.rooms.get(event.rid);
          if (room) {
            room.present.forEach((peerId: string) => {
              if (peerId !== this.ourId) this.destroyPeer(peerId);
            });
            if (room.rtype === RoomType.media) {
              this.currentRid = null;
              this.ourPeer.disableAll();
            }
            this._removeRoom(event.rid);
          }
        }
        break;
      case 'signal':
        {
          const room = this.rooms.get(event.rid);
          if (room) {
            if (room.rtype === RoomType.media && !this.ourPeer.audioStream) {
              console.error('no local stream');
              return;
            }
            let peer =
              this.peers.get(event.from) ||
              this.createPeer(room.rid, room.rtype, event.rid);
            if (peer?.peer.destroyed) {
              console.log(
                'peer was destroyed, but is attempting to reconnect',
                event.from
              );
              this.destroyPeer(event.from);
              peer = this.createPeer(room.rid, room.rtype, event.from);
              return;
            }
            if (!peer) {
              console.log('on signal - no peer found');
              return;
            }
            peer.onReceivedSignal(event.signal);
          }
        }
        break;
      case 'chat':
        if (event.peer_id !== this.ourId) {
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
  async createRoom(
    title: string,
    access: RoomAccess,
    path: string,
    rtype: RoomType = RoomType.media
  ) {
    if (rtype === RoomType.media && !this.ourPeer.audioStream) {
      await this.ourPeer.enableAudio();
    }

    const newRoom = {
      rid: ridFromTitle(this.provider, this.ourId, title),
      rtype: rtype,
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
        rtype: rtype,
        title: title,
        path,
      })
    );

    return newRoom.rid;
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
    const room = this.rooms.get(rid);
    if (room) {
      this.rooms.delete(rid);
      if (room.rtype === RoomType.media) {
        this.currentRid = null;
        this.ourPeer.disableAll();
      }
    }
    this.websocket.send(
      serialize({
        type: 'delete-room',
        rid,
      })
    );
    this.onLeftRoom(rid, this.ourId);
    this.hangupAllPeers(rid);
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
    this.pinnedSpeaker = null;
  }

  @action
  async joinRoom(rid: string) {
    const room = this.rooms.get(rid);
    if (room) {
      if (room.rtype === RoomType.media) {
        this.setCurrentRoom(rid);
        if (!this.ourPeer.audioStream) {
          await this.ourPeer.enableAudio();
        }
      }
    }
    this.websocket.send(
      serialize({
        type: 'enter-room',
        rid,
      })
    );
    // add us to the room
    if (room) {
      room.addPeer(this.ourId);
    }
  }

  @action
  leaveRoom(rid: string) {
    const room = this.rooms.get(rid);
    if (room) {
      room.removePeer(this.ourId);
      if (room.present.length === 0) {
        this.deleteRoom(rid);
      } else {
        if (room.rtype === RoomType.media) {
          this.currentRid = null;
          this.ourPeer.disableAll();
        }
      }
    }
    this.websocket.send(
      serialize({
        type: 'leave-room',
        rid,
      })
    );
    this.onLeftRoom(rid, this.ourId);
    console.log('hangupAllPeers %o...', rid);
    this.hangupAllPeers(rid);
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
  createPeer(rid: string, rtype: RoomType, peerId: string) {
    const room = this.rooms.get(rid);
    if (!room) {
      console.error('createPeer: no room with id %o', rid);
      return;
    }

    let peer = this.peers.get(peerId);
    if (peer) {
      peer.refCount++;
      peer.rooms.set(room.rid, room);
      return;
    }
    const streams: MediaStream[] = [];
    if (rtype === RoomType.media) {
      if (!this.currentRid) {
        console.warn('No current room');
        return;
      }
      if (!this.ourPeer.audioStream) {
        console.error('no local stream');
        // TODO handle this better
        return;
      }
      streams.push(this.ourPeer.audioStream);
      if (this.ourPeer.videoStream) {
        streams.push(this.ourPeer.videoStream);
      } else if (this.ourPeer.screenStream) {
        streams.push(this.ourPeer.screenStream);
      }
    }
    console.log('creating peer', peerId);
    peer = new PeerClass(
      rid,
      this.ourId,
      peerId,
      isInitiator(this.ourId, peerId),
      streams,
      this.websocket,
      {
        onDataChannel: this.onDataChannel.bind(this),
        onLeftRoom: this.onLeftRoom.bind(this),
      }
    );

    peer.on('isSpeakingChanged', (isSpeaking: boolean) => {
      this.updateActiveSpeaker(peerId, isSpeaking);
    });

    peer.rooms.set(rid, room);
    console.log('adding peer: %o', peerId);
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
    const peer = this.peers.get(peerId);
    if (peer) {
      if (peer.refCount === 0) {
        console.warn('peer %o refcount is 0', peer.peerId);
      }
      if (this.currentRid) {
        peer.rooms.delete(this.currentRid);
      }
      peer.refCount--;
      if (peer.refCount === 0) {
        // destroy peer
        peer.destroy();
      }
    }
  }

  @action
  destroyPeer(peerId: string) {
    console.log('destroyPeer. closing peer...');
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.refCount--;
      if (peer.refCount === 0) {
        console.log(`destroyPeer: ${peer.peerId} refCount is 0. clearing...`);
        peer.removeAllListeners();
        peer.destroy();
        this.peers.delete(peerId);
      }
    }
  }

  @action
  hangupAllPeers(rid: string) {
    console.log('hangupAllPeers. closing peer...');
    this.peers.forEach((peer) => {
      peer.rooms.delete(rid);
      if (peer.rooms.size === 0) {
        console.log(
          `hangupAllPeers: ${peer.peerId} peer is in no more rooms. clearing...`
        );
        peer.destroy();
        this.peers.delete(peer.peerId);
      }
    });
    // this.peers.clear();
  }

  @action
  updateActiveSpeaker(peerId: string, isSpeaking: boolean) {
    if (!this.speakers.has(peerId)) {
      this.speakers.set(peerId, {
        isSpeaking,
        currentSession: null,
        sessions: [],
      });
    }

    const speaker = this.speakers.get(peerId);
    if (!speaker) {
      console.warn('updateActiveSpeaker no speaker with id', peerId);
      return;
    }

    if (isSpeaking) {
      speaker.currentSession = { start: Date.now(), end: undefined };
    } else if (speaker.currentSession) {
      // If the speaker stopped speaking, end the current session and add it to the queue
      speaker.currentSession.end = Date.now();
      speaker.currentSession.duration =
        speaker.currentSession.end - speaker.currentSession.start;
      speaker.sessions.push(speaker.currentSession);
      speaker.currentSession = null;
    }

    speaker.isSpeaking = isSpeaking;
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
    const payload = { ...data } as DataPacket;
    this.peers.forEach((peer) => {
      if (!payload.path || peer.rooms.has(payload.path)) {
        console.log(
          'sendDataToRoom: %o, %o, %o',
          payload.from,
          peer.peerId,
          peer.rooms
        );
        peer.sendData(payload);
      }
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
