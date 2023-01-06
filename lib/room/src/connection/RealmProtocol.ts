import { PeerEvent } from '../peer/events';
import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { action, makeObservable, observable, observe, runInAction } from 'mobx';
import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';
import { DataPacket } from 'helpers/data';
import { ridFromTitle } from '../helpers/parsing';
import { isInitiator, isWeb, isWebRTCSignal } from '../utils';

export interface APIHandlers {
  poke: (params: any) => Promise<any>;
  scry: (params: any) => Promise<any>;
}

/**
 * An implementation of the BaseProtocol that uses passed in handlers to communicate with
 * Realm's OS process
 */
export class RealmProtocol extends BaseProtocol {
  poke: (...args: any) => Promise<void>;
  scry: (...args: any) => Promise<any>;
  queuedPeers: Patp[] = []; // peers that we have queued to dial
  disposePresentRoom: any; // this is a mobx observable disposer
  constructor(our: Patp, config: ProtocolConfig, handlers: APIHandlers) {
    super(our, config);

    this.onSignal = this.onSignal.bind(this);
    this.sendSignal = this.sendSignal.bind(this);
    this.cleanup = this.cleanup.bind(this);

    makeObservable(this, {
      queuedPeers: observable,
      dialAll: action.bound,
      hangupAll: action.bound,
      setSessionData: action.bound,
      onSignal: action.bound,
      cleanup: action.bound,
    });

    this.poke = handlers.poke;
    this.scry = handlers.scry;
    this.emit(ProtocolEvent.Ready);
    if (isWeb()) {
      window.removeEventListener('beforeunload', this.cleanup);
      window.addEventListener('beforeunload', this.cleanup);
    }
  }

  cleanup() {
    this.hangupAll();
  }

  async sendSignal(peer: Patp, msg: any) /*: void*/ {
    if (this.presentRoom) {
      this.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-signal',
        json: {
          signal: {
            from: this.local?.patp,
            to: peer,
            rid: this.presentRoom?.rid,
            data: JSON.stringify(msg),
          },
        },
      });
    }
  }

  async onSignal(data: any, mark: string) {
    if (mark === 'rooms-v2-view') {
      if (data['session']) {
        // "session" is sent on initial /lib subscription
        const session = data['session'];
        const currentRoom = session.rooms[session.current];
        this.provider = session.provider;
        this.rooms = new Map(Object.entries(session.rooms));
        if (currentRoom) {
          // if we are in a room, send the event up to RoomManager
          this.emit(ProtocolEvent.RoomInitial, currentRoom);
        }
      }
    }

    if (mark === 'rooms-v2-signal') {
      if (data['signal']) {
        const payload = data['signal'];
        const remotePeer = this.peers.get(payload.from);
        const signalData = JSON.parse(data['signal'].data);
        if (!remotePeer) {
          console.log('got signal from unknown peer', payload.from);
        }

        if (signalData.type === 'waiting') {
          // repeat this on an interval until we get a ready signal
          remotePeer?.onWaiting();
          if (!remotePeer) {
            console.log('got waiting signal from unknown peer', payload.from);
          }
        }

        if (signalData.type === 'ready') {
          remotePeer?.onReady();
          if (!remotePeer) {
            console.log('got ready signal from unknown peer', payload.from);
          }
        }

        if (signalData.type === 'retry') {
          const retryingPeer = this.peers.get(payload.from);
          if (retryingPeer?.isInitiator) {
            retryingPeer.createConnection();
          } else {
            retryingPeer?.dial();
          }
        }
        if (isWebRTCSignal(signalData.type)) {
          // we are receiving a WebRTC signaling data
          if (remotePeer) {
            // we already have a peer for this patp, so we can just pass the signal to it
            if (!remotePeer.peer) {
              // if we don't have a peer connection yet, we need to create one
              remotePeer.createConnection();
              remotePeer.peerSignal(payload.data);
            } else {
              // we have a peer connection and it's open, so we can just pass the signal to it
              remotePeer.peerSignal(payload.data);
            }
          } else {
            console.log('got webrtc signal from unknown peer', payload.from);
          }
        }
      }
    }

    if (mark === 'rooms-v2-reaction') {
      console.log('%rooms', data);
      if (data['chat-received']) {
        const payload = data['chat-received'];
        this.emit(ProtocolEvent.ChatReceived, payload.from, payload.content);
      }
      if (data['mute-status']) {
        const payload = data['mute-status'];
        console.log('mute-status', payload);
        this.emit(ProtocolEvent.PeerMuteStatusChanged, payload.from, payload.status);
      }
      if (data['provider-changed']) {
        const payload = data['provider-changed'];
        this.provider = payload.provider;
        if (this.presentRoom?.rid) {
          const rid = this.presentRoom?.rid;
          this.leave(rid);
          this.emit(ProtocolEvent.RoomDeleted, rid);
        }
        this.rooms = new Map(Object.entries(payload.rooms));
      }
      if (data['room-deleted']) {
        const payload = data['room-deleted'];
        if (this.presentRoom?.rid === payload.rid) {
          this.hangupAll();
          this.emit(ProtocolEvent.RoomDeleted, payload.rid);
        }
        const room = this.rooms.get(payload.rid);
        if (room) {
          this.rooms.delete(payload.rid);
        }
      }
      if (data['room-entered']) {
        // console.log('room entered update');
        const payload = data['room-entered'];
        const room = this.rooms.get(payload.rid);
        if (room) {
          room.present.push(payload.ship);
          this.rooms.set(payload.rid, room);
          if (this.presentRoom?.rid === payload.rid) {
            // if we are in the room, dial the new peer
            if (payload.ship !== this.our) {
              const remotePeer = this.dial(
                payload.ship,
                payload.ship === room.creator
              );
              // queuedPeers are peers that are ready for us to dial them
              if (this.queuedPeers.includes(payload.ship)) {
                remotePeer.createConnection();
                this.queuedPeers.splice(
                  this.queuedPeers.indexOf(payload.ship),
                  1
                );
              }
            } else {
              this.emit(ProtocolEvent.RoomEntered, room);
            }
          } else {
            // if we are not in the room, we need to connect
            if (payload.ship === this.our) {
              this.connect(room);
            }
          }
        }
      }
      if (data['room-left']) {
        // console.log('room left');
        const payload = data['room-left'];
        if (this.presentRoom?.rid === payload.rid) {
          if (payload.ship !== this.our) {
            this.hangup(payload.ship);
          }
          // else we left the room (already)
        }
        const room = this.rooms.get(payload.rid);
        if (room) {
          room.present.splice(room.present.indexOf(payload.ship), 1);
          this.rooms.set(payload.rid, room);
        }
      }
      if (data['room-created']) {
        // console.log('room created');
        const { room } = data['room-created'];
        this.rooms.set(room.rid, room);
        if (room.creator === this.our) {
          this.emit(ProtocolEvent.RoomCreated, room);
        }
      }
      if (data['kicked']) {
        const payload = data['kicked'];
        console.log('kicked update', payload);
        if (this.presentRoom?.rid === payload.rid) {
          // if we are in the room, hangup the peer
          if (payload.ship !== this.our) {
            this.hangup(payload.ship);
          } else {
            this.hangupAll();
            this.emit(ProtocolEvent.RoomKicked, payload.rid);
          }
        }
        const room = this.rooms.get(payload.rid);
        if (room) {
          room.present.splice(room.present.indexOf(payload.ship), 1);
          this.rooms.set(payload.rid, room);
        }
      }
    }
  }

  setSessionData(session: any) {
    const currentRoom = session.rooms[session.current];
    this.provider = session.provider;
    this.rooms = new Map(Object.entries(session.rooms));
    if (currentRoom) {
      // if we are in a room, send the event up to RoomManager
      this.emit(ProtocolEvent.RoomInitial, currentRoom);
    }
  }

  registerLocal(local: LocalPeer) {
    this.local = local;
    this.local.on(PeerEvent.AudioTrackAdded, () => {
      this.peers.forEach((peer: RemotePeer) => {
        this.local?.streamTracks(peer);
      });
    });
    this.local.on(PeerEvent.Muted, () => {
      console.log('muting poke');
      this.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'toggle-mute': true,
        },
      });
    })
    this.local.on(PeerEvent.Unmuted, () => {
      this.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'toggle-mute': false,
        },
      });
    })
  }

  /**
   * No provider in local protocol
   *
   * @param provider
   * @returns string
   */
  async setProvider(provider: Patp): Promise<RoomType[]> {
    this.provider = provider;
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'set-provider': provider,
      },
    });
    return Array.from(this.rooms.values());
  }

  kick(peer: Patp) {
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        kick: {
          rid: this.presentRoom?.rid,
          ship: peer,
        },
      },
    });
  }

  createRoom(
    title: string,
    access: 'public' | 'private',
    path: string | null = null
  ) {
    const newRoom: RoomType = {
      rid: ridFromTitle(this.provider, this.our, title),
      title,
      access,
      provider: this.provider,
      creator: this.our,
      present: [this.our],
      whitelist: [],
      capacity: 6,
      path,
    };
    this.rooms.set(newRoom.rid, newRoom);
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'create-room': {
          rid: newRoom.rid,
          title,
          access,
          path,
        },
      },
    });
    return newRoom;
  }

  /**
   * deleteRoom - pokes the room agent to delete the room
   *
   * @param rid
   */
  async deleteRoom(rid: string) {
    await this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'delete-room': rid,
      },
    });
    if (this.presentRoom?.rid === rid) {
      this.hangupAll();
    }
  }

  async getSession(): Promise<void> {
    try {
      const response = await this.scry({
        app: 'rooms-v2',
        path: '/session',
      });
      this.setSessionData(response['session']);
    } catch (e) {
      console.error(e);
    }
  }

  async getRooms(): Promise<RoomType[]> {
    return Array.from(this.rooms.values());
  }

  getSpaceRooms(path: string): RoomType[] {
    return Array.from(this.rooms.values()).filter((room) => room.path === path);
  }

  async getRoom(rid: string): Promise<RoomType> {
    const room = this.rooms.get(rid);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  async connect(room: RoomType): Promise<Map<Patp, RemotePeer>> {
    if (!room.present.includes(this.our)) {
      this.rooms.set(room.rid, room);
      await this.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'enter-room': room.rid,
        },
      });
    }
    runInAction(() => {
      this.presentRoom = room;
      this.disposePresentRoom = observe(this.presentRoom, (change) => {
        this.emit(ProtocolEvent.RoomUpdated, change.object);
      });
    });

    return this.dialAll(room);
  }

  /**
   * sendData - Send data to all peers
   * @param data: DataPacket
   */
  sendData(data: DataPacket) {
    this.peers.forEach((peer) => {
      peer.sendData(data);
    });
  }

  /**
   * sendChat - Send data to all peers
   * @param data: DataPacket
   */
  sendChat(content: string) {
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'send-chat': content,
      },
    });
  }

  dial(peer: Patp, isHost: boolean): RemotePeer {
    if (!this.local) {
      throw new Error('No local peer created');
    }
    const peerConfig = {
      isHost,
      isInitiator: isInitiator(this.local.patpId, peer),
      rtc: this.rtc,
    };
    const remotePeer = new RemotePeer(
      this.our,
      peer,
      peerConfig,
      this.sendSignal
    );

    this.peers.set(remotePeer.patp, remotePeer);
    remotePeer.dial();
    // When we connect, lets stream our local tracks to the remote peer
    remotePeer.on(PeerEvent.Connected, () => {
      this.local?.streamTracks(remotePeer);
    });

    remotePeer.on(PeerEvent.ReceivedData, (data: DataPacket) => {
      this.emit(ProtocolEvent.PeerDataReceived, remotePeer.patp, data);
    });

    this.emit(ProtocolEvent.PeerAdded, remotePeer);

    return remotePeer;
  }

  async dialAll(room: RoomType): Promise<Map<Patp, RemotePeer>> {
    const peers = room.present.filter((peer: Patp) => this.our !== peer);
    await Promise.all(
      peers.map((peer: Patp) => this.dial(peer, peer === room.creator))
    );
    return this.peers;
  }

  retry(peer: Patp) {
    const remotePeer = this.peers.get(peer);
    if (remotePeer) {
      this.sendSignal(peer, { type: 'retry', from: this.our });
    }
  }

  /**
   *  redial - reconstruct and listen for connected state
   *
   * @param remotePeer
   * @returns Promise<RemotePeer>
   */
  redial(remotePeer: RemotePeer): Promise<RemotePeer> {
    return new Promise((resolve, reject) => {
      remotePeer.dial();
      remotePeer.once(PeerEvent.Connected, () => {
        resolve(remotePeer);
      });
      remotePeer.once(PeerEvent.Failed, (err: Error) => {
        reject(err);
      });
    });
  }

  hangup(peer: Patp, { shouldEmit } = { shouldEmit: true }) {
    const remotePeer = this.peers.get(peer);
    if (remotePeer) {
      remotePeer.hangup();
      shouldEmit && this.emit(ProtocolEvent.PeerRemoved, remotePeer);
      this.peers.delete(peer);
    }
  }

  /**
   * hangupAll - handles hanging up all peers
   *   subscription update
   *
   * @param rid
   */
  hangupAll() {
    this.presentRoom = undefined;
    this.disposePresentRoom && this.disposePresentRoom();
    //  hangup all peers
    this.peers.forEach((peer) => {
      this.hangup(peer.patp, { shouldEmit: false });
    });
    this.peers.clear();
  }

  async leave(rid: string) {
    this.hangupAll();
    this.peers.clear();
    const room = this.rooms.get(rid);
    await this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'leave-room': rid,
      },
    });
    this.emit(ProtocolEvent.RoomLeft, room!);
  }
}

// const retry = (callback: any, times = 3) => {
//   let numberOfTries = 0;
//   return new Promise((resolve) => {
//     const interval = setInterval(async () => {
//       numberOfTries++;
//       if (numberOfTries === times) {
//         console.log(`Trying for the last time... (${times})`);
//         clearInterval(interval);
//       }
//       try {
//         await callback();
//         clearInterval(interval);
//         console.log(`Operation successful, retried ${numberOfTries} times.`);
//         resolve(null);
//       } catch (err) {
//         console.log(`Unsuccessful, retried ${numberOfTries} times... ${err}`);
//       }
//     }, 2500);
//   });
// };
