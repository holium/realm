import { PeerEvent } from '../peer/events';
import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { action, makeObservable, observable, observe, runInAction } from 'mobx';
import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';
import { DataPacket } from 'helpers/data';
import { ridFromTitle } from '../helpers/parsing';
import { isInitiator } from '../utils';

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

    makeObservable(this, {
      queuedPeers: observable,
      dialAll: action.bound,
      hangupAll: action.bound,
      setSessionData: action.bound,
      onSignal: action.bound,
    });

    this.poke = handlers.poke;
    this.scry = handlers.scry;
    this.emit(ProtocolEvent.Ready);
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
        if (signalData.type === 'ready') {
          // another peer is indicating that they are ready for us to dial them
          if (remotePeer) {
            console.log('got ready signal from remotePeer:', payload.from);
            // we already have a peer for this patp, so we can just create a peer connection
            remotePeer.ackReady();
          } else {
            // we don't have a remotePeer for this patp, so we need to queue one, they
            // will be entering the room soon
            console.log(
              'got ready signal from someone we dont have a remotePeer setup for:',
              payload.from
            );
            const remotePeer = this.dial(payload.from, false);
            remotePeer.ackReady();
          }
        }
        if (signalData.type === 'ack-ready') {
          if (remotePeer) {
            console.log(
              'got ack-ready signal from a remotePeer:',
              payload.from
            );
            if (this.queuedPeers.includes(payload.from)) {
              console.log(
                'got ack-ready from peer we queued, creating connection for:',
                payload.from
              );
              remotePeer.createConnection();
              this.queuedPeers.splice(
                this.queuedPeers.indexOf(payload.from),
                1
              );
            } else {
              console.log(
                'got ack-ready from peer we already have a connection for:',
                payload.from
              );
            }
          } else {
            console.log(
              'got ack-ready from peer we dont have a remotePeer connection for:',
              payload.from
            );
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
        if (!['ready', 'retry', 'ack-ready'].includes(signalData.type)) {
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
            // we dont have a remotePeer for this patp and we are getting WebRTC signaling data, for now just log it
            if (this.presentRoom?.present.includes(payload.from)) {
              console.log(
                'got signal from peer in room, but with no peer connection, creating:',
                payload.from
              );
              const remotePeer = this.dial(payload.from, false);
              remotePeer.createConnection();
              remotePeer.peerSignal(payload.data);
            } else {
              console.log('got signal from peer not in room', payload.from);
            }
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
      if (data['provider-changed']) {
        const payload = data['provider-changed'];
        this.provider = payload.provider;
        if (this.presentRoom?.rid) {
          const rid = this.presentRoom?.rid;
          this.hangupAll();
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
              console.log('we should dial the others');
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
    console.log('kicking peer', this.presentRoom?.rid, peer);
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
  deleteRoom(rid: string) {
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'delete-room': rid,
      },
    });
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
    const remotePeer = new RemotePeer(
      this.our,
      peer,
      {
        isHost,
        isInitiator: isInitiator(this.local.patpId, peer),
        rtc: this.rtc,
      },
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

  async dialAll(room: RoomType): Promise<Map<Patp, RemotePeer>> {
    const peers = room.present.filter((peer: Patp) => this.our !== peer);
    await Promise.all(
      peers.map((peer: Patp) => this.dial(peer, peer === room.creator))
    );
    return this.peers;
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
    this.disposePresentRoom();
    //  hangup all peers
    this.peers.forEach((peer) => {
      this.hangup(peer.patp, { shouldEmit: false });
    });
    this.peers.clear();
  }

  leave(rid: string) {
    this.hangupAll();
    this.peers.clear();
    const room = this.rooms.get(rid);
    this.poke({
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
