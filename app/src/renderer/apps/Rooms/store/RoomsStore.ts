import { patp2dec } from '@urbit/aura';
import EventsEmitter from 'events';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { SoundActions } from 'renderer/lib/sound';
import { RealmIPC } from 'renderer/stores/ipc';
import { shipStore } from 'renderer/stores/ship.store';

import { serialize, unserialize } from './helpers';
import { LocalPeer } from './LocalPeer';
import { PeerClass } from './Peer';
import { DataPacket, DataPacketKind } from './room.types';

type RoomAccess = 'public' | 'private';

export enum RoomType {
  media = 'media',
  background = 'background',
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
  path: string | null;
};

export const providerFromRid = (rid: string) => {
  return rid.split('/')[0];
};

export const ridFromPath = (provider: string, our: string, path: string) => {
  const slugified = path
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-');
  return `${provider}/rooms/${our}/${slugified}`;
};

const isInitiator = (from: string, to: string) => {
  return patp2dec(from) > patp2dec(to);
};

export type OnDataChannel = (
  // subscription path peer is watching
  path: string,
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
  @observable path: string | null = null;

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
      this.hangupAllPeers('*');
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

  @action
  pinSpeaker(speakerId: string) {
    if (speakerId === this.pinnedSpeaker) {
      this.pinnedSpeaker = null;
      return;
    }
    this.pinnedSpeaker = speakerId;
  }

  @action
  async setMuteStatus(rid: string, muteStatus: boolean) {
    const room = this.rooms.get(rid);
    if (!room) {
      console.error('setMuteStatus: room %o not found', rid);
      return;
    }
    if (room.rtype === RoomType.background) {
      console.error('setMuteStatus: unexpected. room type is background');
      return;
    }
    this.sendDataToRoom({
      path: rid,
      kind: DataPacketKind.MUTE_STATUS,
      value: {
        data: muteStatus,
      },
    });
  }

  @action
  async toggleVideo(rid: string, enableVideo: boolean) {
    const room = this.rooms.get(rid);
    if (!room) {
      console.error('toggleVideo: room %o not found', rid);
      return;
    }
    if (room.rtype === RoomType.background) {
      console.error('toggleVideo: unexpected. room type is background');
      return;
    }
    if (!enableVideo) {
      this.peers.forEach((peer) => {
        if (
          (rid === '*' || peer.rooms.includes(rid)) &&
          this.ourPeer.videoStream &&
          peer.peer.streams.includes(this.ourPeer.videoStream)
        ) {
          peer.peer.removeStream(this.ourPeer.videoStream);
        }
      });
      this.ourPeer.disableVideo();
      this.sendDataToRoom({
        path: rid,
        kind: DataPacketKind.WEBCAM_CHANGED,
        value: {
          data: false,
        },
      });
    } else {
      const stream = await this.ourPeer.enableVideo();
      this.peers.forEach((peer) => {
        if (stream && (rid === '*' || peer.rooms.includes(rid))) {
          peer.setNewStream(stream);
        }
      });
      this.sendDataToRoom({
        path: rid,
        kind: DataPacketKind.WEBCAM_CHANGED,
        value: {
          data: true,
        },
      });
    }
  }

  @action
  async toggleScreenShare(rid: string, enableScreenSharing: boolean) {
    const room = this.rooms.get(rid);
    if (!room) {
      console.error('toggleVideo: room %o not found', rid);
      return;
    }
    if (room.rtype === RoomType.background) {
      console.error('toggleVideo: unexpected. room type is background');
      return;
    }
    if (!enableScreenSharing) {
      this.peers.forEach((peer) => {
        if (
          (rid === '*' || peer.rooms.includes(rid)) &&
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
    const protocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
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
        if (event.room.rtype === RoomType.media && !this.ourPeer.audioStream) {
          runInAction(async () => {
            await this.ourPeer.enableAudio();
          });
        }
        break;
      case 'room-entered':
        {
          console.log('room entered', event);
          const room = this.rooms.get(event.room.rid);
          if (room) {
            room.update(event.room);
            if (
              event.room.rtype === RoomType.media &&
              !this.ourPeer.audioStream
            ) {
              console.error('no local stream');
              return;
            }
            // if we entered a room, we need to create a peer for each user in the room
            if (event.peer_id === this.ourId) {
              const peers = event.room.present.filter(
                (peer: string) => peer !== this.ourId
              );
              for (let i = 0; i < peers.length; i++) {
                const peerId = peers[i];
                const peer = this.peers.get(peerId);
                if (peer) {
                  peer.rooms.push(event.rid);
                  continue;
                }
                this.createPeer(event.rid, event.rtype, peerId);
              }
            } else {
              // someone else entered the room
              console.log('someone entered the room', event);
              this.createPeer(event.rid, event.rtype, event.peer_id);
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
            if (event.peer_id === this.ourId) {
              this.hangupAllPeers(room.rid);
            } else {
              if (
                shipStore.settingsStore.systemSoundsEnabled &&
                !(room.rtype === RoomType.background)
              ) {
                SoundActions.playRoomPeerLeave();
              }
              console.log('someone left the room', event);
              const peer = this.peers.get(event.peer_id);
              if (peer) {
                peer.rooms = peer.rooms.filter((rid) => rid === event.room.rid);
                if (peer.rooms.length === 0) {
                  this.destroyPeer(event.peer_id);
                }
              }
              room.removePeer(event.peer_id);
            }
          }
        }
        break;
      case 'room-deleted':
        {
          const room = this.rooms.get(event.rid);
          if (room) {
            room.present.forEach((peerId: string) => {
              if (peerId !== this.ourId) {
                const peer = this.peers.get(peerId);
                if (peer) {
                  peer.rooms = peer.rooms.filter(
                    (rid) => rid === event.room.rid
                  );
                  if (peer.rooms.length === 0) {
                    this.destroyPeer(peerId);
                  }
                }
              }
            });
            // remove the room
            this._removeRoom(event.rid);
            if (this.countRooms(event.rtype) === 0) {
              this.ourPeer.disableAll();
            }
          }
        }
        break;
      case 'signal':
        {
          const room = this.rooms.get(event.rid);
          if (room) {
            if (room.rtype === RoomType.media) {
              if (!this.ourPeer.audioStream) {
                console.error('no local stream');
                return;
              }
            }
            let peer =
              this.peers.get(event.from) ||
              this.createPeer(room.rid, room.rtype, room.rid);
            if (peer?.peer.destroyed) {
              console.log(
                'peer was destroyed, but is attempting to reconnect',
                event.from
              );
              this.destroyPeer(event.from);
              peer = this.createPeer(event.from, room.rtype, event.from);
              return;
            }
            if (!peer) {
              console.log('on signal - no peer found');
              return;
            }
            peer.rooms.push(room.rid);
            peer.onReceivedSignal(event.signal);
          }
        }
        break;
      case 'chat':
        if (this.rooms.has(event.rid) && event.peer_id !== this.ourId) {
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
    if (!this.ourPeer.audioStream) {
      await this.ourPeer.enableAudio();
    }

    const rid = ridFromPath(this.provider, this.ourId, path);

    const newRoom = {
      rid: rid,
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
        rid: rid,
        rtype: rtype === RoomType.media ? 'media' : 'background',
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
    this.rooms.delete(rid);
    this.ourPeer.disableAll();
    this.websocket.send(
      serialize({
        type: 'delete-room',
        rid,
      })
    );
    this.onLeftRoom(rid, this.ourId);
    this.hangupAllPeers(rid);
    this.pinnedSpeaker = null;
  }

  @action
  async joinRoom(rid: string) {
    const room = this.rooms.get(rid);
    // are we already in the room? if so , no need to reenter
    if (room && room.present.includes(this.ourId)) {
      console.log('%o already in room', this.ourId);
      return;
    }
    if (room) {
      if (room.rtype === RoomType.media && !this.ourPeer.audioStream) {
        await this.ourPeer.enableAudio();
      }
    }
    this.websocket.send(
      serialize({
        type: 'enter-room',
        rid,
      })
    );
    if (room) {
      // add us to the room
      room.addPeer(this.ourId);
    }
  }

  @action
  countRooms(rtype: RoomType): number {
    let result = 0;
    // then check to see if we're in any other media rooms. if not, disable media
    for (const room of this.rooms.entries()) {
      if (room[1].rtype === rtype) {
        result++;
      }
    }
    return result;
  }

  @action findActiveRoom(rtype: RoomType): RoomModel | null {
    let result = null;
    for (const entry of this.rooms.entries()) {
      if (entry[1].rtype === rtype && entry[1].present.includes(this.ourId)) {
        result = entry[1];
      }
    }
    return result;
  }

  @action
  leaveRoom(rid: string) {
    const room = this.rooms.get(rid);
    if (room) {
      room.removePeer(this.ourId);
      // background rooms are deleted only after all participants have left
      if (room.rtype === RoomType.background && room.present.length === 0) {
        this.deleteRoom(rid);
      } else {
        // only disable media if we are not in any other media rooms
        if (this.countRooms(RoomType.media) === 0) {
          console.log('leaveRoom: disabling all media');
          this.ourPeer.disableAll();
        }
        this.websocket.send(
          serialize({
            type: 'leave-room',
            rid,
          })
        );
        this.onLeftRoom(rid, this.ourId);
        this.hangupAllPeers(rid);
      }
    }
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
  createPeer(roomId: string, roomType: RoomType, peerId: string) {
    let streams: MediaStream[] = [];
    if (roomType === RoomType.media) {
      if (!this.ourPeer.audioStream) {
        console.error('no local stream');
        // TODO handle this better
        return;
      }
      console.log('creating peer', peerId);
      streams = [this.ourPeer.audioStream];
      if (this.ourPeer.videoStream) {
        streams.push(this.ourPeer.videoStream);
      } else if (this.ourPeer.screenStream) {
        streams.push(this.ourPeer.screenStream);
      }
    }
    const peer = new PeerClass(
      roomId,
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

    this.peers.set(peerId, peer);
    return peer;
  }

  @action
  retryPeer(peerId: string) {
    this.peers.get(peerId)?.retry();
  }

  @action
  kickPeer(rid: string, peerId: string) {
    // remove peer from room by sending kick signal
    this.websocket.send(
      serialize({
        type: 'kick',
        rid: rid,
        peer_id: peerId,
      })
    );
    // destroy peer
    this.peers.get(peerId)?.destroy();
  }

  @action
  destroyPeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.removeAllListeners();
      peer.destroy();
      this.peers.delete(peerId);
    }
  }

  @action
  hangupAllPeers(rid: string) {
    for (const peer of this.peers.entries()) {
      if (rid === '*' || peer[1].rooms.includes(rid)) {
        peer[1].destroy();
        this.peers.delete(peer[0]);
      }
    }
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
    const payload = { from: this.ourId, ...data } as DataPacket;
    const rid = !data.path || data.path === '*' ? null : data.path;
    this.peers.forEach((peer) => {
      if (!rid || peer.rooms.includes(rid)) {
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
