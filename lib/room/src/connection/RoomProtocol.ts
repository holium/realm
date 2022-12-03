import { PeerEvent } from './../peer/events';
import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { action, makeObservable, observable } from 'mobx';
import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';
import { DataPacket } from 'helpers/data';
import UrbitHttpApi from '@urbit/http-api';
import { ridFromTitle } from '../helpers/parsing';

export interface ShipConfig {
  ship: string;
  url: string;
  code: string;
}
export class RoomProtocol extends BaseProtocol {
  api?: UrbitHttpApi;
  shipConfig: ShipConfig;
  queuedPeers: Patp[] = [];
  constructor(our: Patp, config: ProtocolConfig, shipConfig: ShipConfig) {
    super(our, config);
    this.shipConfig = shipConfig;

    makeObservable(this, {
      api: observable,
      dialAll: action.bound,
      hangupAll: action.bound,
      onSignal: action.bound,
    });

    this.sendSignal = this.sendSignal.bind(this);
  }

  async init(shipConfig: ShipConfig) {
    this.api = await UrbitHttpApi.authenticate(shipConfig);
    this.api?.connect().then(() => {
      this.emit(ProtocolEvent.Ready);
      // console.log('Room protocol signaling onopen');
      this.api?.subscribe({
        app: 'rooms-v2',
        path: '/lib',
        err: (error: any, id: string) => {
          console.log('room agent error', error);
        },
        event: (data: any, mark: string) => {
          this.onSignal(data, mark);
        },
        quit: (data: any) => {
          console.log('room agent quit', data);
        },
      });
    });
  }

  sendSignal(peer: Patp, msg: any): void {
    if (this.presentRoom) {
      this.api?.poke({
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

  onSignal(data: any, mark: string) {
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
            // we already have a peer for this patp, so we can just create a peer connection
            remotePeer.createConnection();
          } else {
            // we don't have a remotePeer for this patp, so we need to queue one, they
            // will be entering the room soon
            this.queuedPeers.push(payload.from);
          }
        }
        if (signalData.type !== 'ready') {
          // we are receiving a WebRTC signaling data
          if (remotePeer) {
            // we already have a peer for this patp, so we can just pass the signal to it
            if (!remotePeer.peer) {
              // if we don't have a peer connection yet, we need to create one
              remotePeer.createConnection();
              remotePeer.peerSignal(payload.data);
            } else if (remotePeer.status === 'closed') {
              // if we have a peer connection but it's closed, we need to recreate it
              remotePeer.peer.destroy();
              remotePeer.createConnection();
              remotePeer.peerSignal(payload.data);
            } else {
              // we have a peer connection and it's open, so we can just pass the signal to it
              remotePeer.peerSignal(payload.data);
            }
          } else {
            // we dont have a remotePeer for this patp and we are getting WebRTC signaling data, for now just log it
            console.warn('remotePeer not created, but getting signaling data');
          }
        }
      }
    }

    if (mark === 'rooms-v2-reaction') {
      console.log('room agent reaction', data);
      if (data['provider-changed']) {
        const payload = data['provider-changed'];
        this.provider = payload.provider;
        this.rooms = new Map(Object.entries(payload.rooms));
      }
      if (data['room-deleted']) {
        const payload = data['room-deleted'];
        const room = this.rooms.get(payload.rid);
        if (room) {
          if (room.present.includes(this.our)) {
            this.hangupAll(payload.rid);
            this.emit(ProtocolEvent.RoomDeleted, payload.rid);
          }
          this.rooms.delete(payload.rid);
        }
      }
      if (data['room-entered']) {
        const payload = data['room-entered'];
        const room = this.rooms.get(payload.rid);
        if (room) {
          room.present.push(payload.ship);
          this.rooms.set(payload.rid, room);
          if (this.presentRoom?.rid === payload.rid) {
            // if we are in the room, dial the new peer
            if (payload.ship !== this.our) {
              this.dial(payload.ship, payload.ship === room.creator).then(
                (remotePeer: RemotePeer) => {
                  // queuedPeers are peers that are ready for us to dial them
                  if (this.queuedPeers.includes(payload.ship)) {
                    remotePeer.createConnection();
                  }
                  this.queuedPeers.splice(
                    this.queuedPeers.indexOf(payload.ship),
                    1
                  );
                }
              );
            } else {
              this.emit(ProtocolEvent.RoomEntered, payload.rid);
            }
          }
        }
      }
      if (data['room-left']) {
        const payload = data['room-left'];
        const room = this.rooms.get(payload.rid);
        if (room) {
          if (this.presentRoom?.rid === payload.rid) {
            // if we are in the room, hangup the peer
            if (payload.ship !== this.our) {
              this.hangup(payload.ship);
            }
          }
          room.present.splice(room.present.indexOf(payload.ship), 1);
          this.rooms.set(payload.rid, room);
        }
      }
      if (data['room-created']) {
        const { room } = data['room-created'];
        this.rooms.set(room.rid, room);
        if (room.creator === this.our) {
          this.emit(ProtocolEvent.RoomCreated, room);
        }
      }
      if (data['kicked']) {
        console.log('kicked from room', data['kicked']);
        const payload = data['kicked'];
        const room = this.rooms.get(payload.rid);
        if (room) {
          if (this.presentRoom?.rid === payload.rid) {
            // if we are in the room, hangup the peer
            if (payload.ship !== this.our) {
              this.hangup(payload.ship);
            } else {
              this.emit(ProtocolEvent.RoomKicked, payload.rid);
            }
          }
          room.present.splice(room.present.indexOf(payload.ship), 1);
          this.rooms.set(payload.rid, room);
        }
      }
    }
  }

  registerLocal(local: LocalPeer) {
    this.local = local;
  }

  /**
   * No provider in local protocol
   *
   * @param provider
   * @returns string
   */
  async setProvider(provider: Patp): Promise<RoomType[]> {
    this.provider = provider;
    return Array.from(this.rooms.values());
  }

  kick(peer: Patp) {
    this.api?.poke({
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

  createRoom(title: string, access: 'public' | 'private') {
    const newRoom: RoomType = {
      rid: ridFromTitle(this.provider, title),
      title,
      access,
      provider: this.provider,
      creator: this.our,
      present: [this.our],
      whitelist: [],
      capacity: 6,
      path: null,
    };
    this.rooms.set(newRoom.rid, newRoom);
    this.api?.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'create-room': {
          rid: newRoom.rid,
          title,
          access,
          path: null,
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
    this.api?.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'delete-room': rid,
      },
    });
  }

  async getRooms(): Promise<RoomType[]> {
    const res = await this.api?.scry({
      app: 'rooms-v2',
      path: '/rooms',
    });
    this.rooms = await res.json();
    return Array.from(this.rooms.values());
  }

  async getRoom(rid: string): Promise<RoomType> {
    const room = this.rooms.get(rid);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  async connect(room: RoomType): Promise<Map<Patp, RemotePeer>> {
    this.presentRoom = room;
    if (!room.present.includes(this.our)) {
      await this.api?.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'enter-room': room.rid,
        },
      });
    }
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
    this.api?.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'send-chat': content,
      },
    });
  }

  async dial(peer: Patp, isHost: boolean): Promise<RemotePeer> {
    if (!this.local) {
      throw new Error('No local peer created');
    }
    const remotePeer = new RemotePeer(
      this.our,
      peer,
      {
        isHost,
        isInitiator: RemotePeer.isInitiator(this.local.patpId, peer),
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
    remotePeer.on(PeerEvent.Closed, () => {
      if (this.presentRoom?.present.includes(peer)) {
        if (!remotePeer.isInitiator) {
          // TODO this is a hack to get around the fact that we can't dial
          // the 3 retries is a default for now
          retry(() => remotePeer.dial(), 3);
        } else {
          remotePeer.createConnection();
        }
      }
    });
    remotePeer.on(PeerEvent.ReceivedData, (data: DataPacket) => {
      this.emit(ProtocolEvent.PeerDataReceived, remotePeer.patp, data);
    });

    return remotePeer;
  }

  /**
   *  redial - reconstruct and listen for connected state
   *  TODO revisit this
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
    const remotePeers = await Promise.all(
      peers.map(
        async (peer: Patp) => await this.dial(peer, peer === room.creator)
      )
    );
    action(() => {
      this.peers = new Map(
        remotePeers.map(
          action((remotePeer) => {
            return [remotePeer.patp, remotePeer];
          })
        )
      );
    });
    return this.peers;
  }

  hangup(peer: Patp) {
    const remotePeer = this.peers.get(peer);
    if (remotePeer) {
      remotePeer.hangup();
      this.peers.delete(peer);
    }
  }

  /**
   * hangupAll - handles hanging up all peers
   *   subscription update
   *
   * @param rid
   */
  hangupAll(rid: string) {
    //  hangup all peers
    this.rooms.get(rid)?.present.forEach((patp) => {
      this.hangup(patp);
    });
  }

  async leave() {
    const presentRoom = this.presentRoom;
    if (!presentRoom) {
      throw new Error('No room to leave');
    }
    if (presentRoom.present.includes(this.our)) {
      this.presentRoom = undefined;
      this.peers.clear();
      await this.api?.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'leave-room': presentRoom.rid,
        },
      });
    }
  }
}

const retry = (callback: any, times = 3) => {
  let numberOfTries = 0;
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      numberOfTries++;
      if (numberOfTries === times) {
        console.log(`Trying for the last time... (${times})`);
        clearInterval(interval);
      }
      try {
        await callback();
        clearInterval(interval);
        console.log(`Operation successful, retried ${numberOfTries} times.`);
        resolve(null);
      } catch (err) {
        console.log(`Unsuccessful, retried ${numberOfTries} times... ${err}`);
      }
    }, 2500);
  });
};
