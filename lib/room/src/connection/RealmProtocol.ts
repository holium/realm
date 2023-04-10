import { PeerEvent } from '../peer/events';
import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';
import { DataPacket, DataPacket_Kind, DataPayload } from '../helpers/data';
import { ridFromTitle } from '../helpers/parsing';
import { isDialer } from '../utils';
import { PeerConnectionState } from '../peer/types';

export function isWebRTCSignal(type: any): boolean {
  return !['retry', 'ack-waiting', 'waiting'].includes(type);
}

export interface APIHandlers {
  poke: (params: any) => Promise<any>;
  scry: (params: any) => Promise<any>;
}

interface RoomTransitionStates {
  creating: RoomType | null;
  leaving: RoomType | null;
  entering: RoomType | null;
  deleting: RoomType | null;
}

/**
 * An implementation of the BaseProtocol that uses passed in handlers to communicate with
 * Realm's OS process
 */
export class RealmProtocol extends BaseProtocol {
  poke: (...args: any) => Promise<void>;
  scry: (...args: any) => Promise<any>;
  queuedPeers: Map<string, Patp[]> = new Map(); // peers that we have queued to dial
  disposePresentRoom: any; // this is a mobx observable disposer
  transitions: RoomTransitionStates; // keeps track of transitions for latency handling

  constructor(our: Patp, config: ProtocolConfig, handlers: APIHandlers) {
    super(our, config);

    this.onSignal = this.onSignal.bind(this);
    this.sendSignal = this.sendSignal.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.transitions = {
      creating: null,
      leaving: null,
      entering: null,
      deleting: null,
    };

    makeObservable(this, {
      queuedPeers: observable,
      transitions: observable,
      dialAll: action.bound,
      hangupAll: action.bound,
      setSessionData: action.bound,
      onSignal: action.bound,
      cleanup: action.bound,
    });

    this.poke = handlers.poke;
    this.scry = handlers.scry;
    this.emit(ProtocolEvent.Ready);
  }

  cleanup() {
    for (let rid of this.peers.keys()) {
      this.hangupAll(rid);
    }
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

  async sendSignal(rid: string, peer: Patp, msg: any) /*: void*/ {
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-signal',
      json: {
        signal: {
          from: this.local?.patp,
          to: peer,
          rid,
          data: JSON.stringify(msg),
        },
      },
    });
  }

  async onSignal(data: any, mark: string) {
    if (mark === 'rooms-v2-view') {
      if (data['session']) {
        // "session" is sent on initial /lib subscription
        const session = data['session'];
        const currentRoom = session.rooms[session.current];
        this.provider = session.provider;
        /*if (this.presentRoom) {*/
        await this.leave(data['session'].rid);
        /*}*/
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
        const roomPeers = this.peers.get(payload.rid);
        if (!roomPeers) throw new Error('Room peers not found');
        const remotePeer = roomPeers.get(payload.from);
        const signalData = JSON.parse(data['signal'].data);

        if (signalData.type === 'waiting') {
          if (!remotePeer) {
            console.log(`%waiting from unknown ${payload.from}`);
            this.queuedPeers.get(payload.rid)?.push(payload.from);
          } else {
            console.log(`%waiting from ${payload.from}`);
            remotePeer.onWaiting();
          }
        }
        if (signalData.type === 'retry') {
          const roomPeers = this.peers.get(payload.rid);
          const retryingPeer = roomPeers?.get(payload.from);
          retryingPeer?.dial();
        }
        if (isWebRTCSignal(signalData.type)) {
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
    }

    if (mark === 'rooms-v2-reaction') {
      if (data['provider-changed']) {
        const payload = data['provider-changed'];
        this.provider = payload.provider;
        this.leave(payload.rid);
        this.emit(ProtocolEvent.RoomDeleted, payload.rid);
        this.rooms = new Map(Object.entries(payload.rooms));
      }
      if (data['room-deleted']) {
        const payload = data['room-deleted'];
        console.log(`%room-deleted rid=${payload.rid}`);
        this.hangupAll(payload.rid);
        this.emit(ProtocolEvent.RoomDeleted, payload.rid);
        this.rooms.delete(payload.rid);
      }
      if (data['room-entered']) {
        const payload = data['room-entered'];
        console.log(`%room-entered ${payload.ship}`);
        const room = this.rooms.get(payload.rid);
        if (room) {
          room.present.push(payload.ship);
          this.rooms.set(payload.rid, room);
          // if we are in the room, dial the new peer
          if (payload.ship !== this.our) {
            const remotePeer = this.dial(
              payload.rid,
              payload.ship,
              payload.ship === room.creator
            );
            // queuedPeers are peers that are ready for us to dial them
            if (this.queuedPeers.get(payload.rid)?.includes(payload.ship)) {
              console.log('%room-entered in queuedPeer', payload.ship);
              remotePeer.onWaiting();
              const roomQueue = this.queuedPeers.get(payload.rid);
              roomQueue?.splice(roomQueue.indexOf(payload.ship), 1);
            }
          } else {
            this.emit(ProtocolEvent.RoomEntered, room);
            this.transitions.entering = null;
          }
          // else {
          //   // if we are not in the room, we need to connect
          //   console.log('we arent in the room yet', payload.rid);
          //   if (payload.ship === this.our) {
          //     this.connect(room);
          //   }
          // }
        }
      }
      if (data['room-left']) {
        const payload = data['room-left'];
        console.log(`%room-left ${payload.ship}`);
        if (payload.ship !== this.our) {
          this.hangup(payload.rid, payload.ship);
        } else {
          this.hangupAll(payload.rid);
          this.emit(ProtocolEvent.RoomLeft, payload.rid);
          this.transitions.leaving = null;
        }
        const room = this.rooms.get(payload.rid);
        if (room) {
          if (room.present.indexOf(payload.ship) !== -1) {
            room.present.splice(room.present.indexOf(payload.ship), 1);
          }
        }
      }
      if (data['room-created']) {
        const { room } = data['room-created'];
        console.log(`%room-created ${room.creator}`);
        this.rooms.set(room.rid, room);
        if (room.creator === this.our) {
          this.emit(ProtocolEvent.RoomCreated, room);
          this.transitions.creating = null;
        }
      }
      if (data['kicked']) {
        const payload = data['kicked'];
        console.log(`%room-kicked ${payload.ship}`);
        // if we are in the room, hangup the peer
        if (payload.ship !== this.our) {
          this.hangup(payload.rid, payload.ship);
        } else {
          this.hangupAll(payload.rid);
          this.emit(ProtocolEvent.RoomKicked, payload.rid);
        }
        const room = this.rooms.get(payload.rid);
        if (room) {
          room.present.splice(room.present.indexOf(payload.ship), 1);
          // this.rooms.set(payload.rid, room);
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

  registerLocals(local: LocalPeer, campfireLocal: LocalPeer) {
    this.local = local;
    this.campfireLocal = campfireLocal;
    this.local.on(PeerEvent.AudioTrackAdded, () => {
      this.peers.forEach((peer: RemotePeer) => {
        this.local?.streamTracks(peer);
      });
    });
    this.local.on(PeerEvent.VideoTrackAdded, () => {
      this.peers.forEach((peer: RemotePeer) => {
        this.local?.streamTracks(peer);
      });
    });
    this.local.on(PeerEvent.Muted, () => {
      this.sendData({
        kind: DataPacket_Kind.MUTE_STATUS,
        value: { data: true },
      });
    });
    this.local.on(PeerEvent.Unmuted, () => {
      this.sendData({
        kind: DataPacket_Kind.MUTE_STATUS,
        value: { data: false },
      });
    });
    this.local.on(PeerEvent.IsSpeakingChanged, (speaking: boolean) => {
      this.sendData({
        kind: DataPacket_Kind.SPEAKING_CHANGED,
        value: { data: speaking },
      });
    });
  }

  async connect(room: RoomType): Promise<Map<string, Map<Patp, RemotePeer>>> {
    if (!room.present.includes(this.our)) {
      this.rooms.set(room.rid, room);
      this.transitions.entering = room;
      await this.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'enter-room': room.rid,
        },
      });
    }
    runInAction(() => {
      /*this.disposePresentRoom = observe(this.presentRoom, (change) => {
        this.emit(ProtocolEvent.RoomUpdated, change.object);
      });*/
    });

    return this.dialAll(room);
  }

  createRoom(
    title: string,
    access: 'public' | 'private',
    path: string | null = null,
    type: 'rooms' | 'campfire' | 'data'
  ) {
    const newRoom: RoomType = {
      rid: ridFromTitle(this.provider, this.our, title),
      title,
      access,
      provider: type !== 'rooms' ? this.our : this.provider,
      creator: this.our,
      present: [this.our],
      whitelist: [],
      capacity: 6,
      path,
      type,
    };
    console.log(newRoom);
    this.transitions.creating = newRoom;
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
          type,
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
    this.hangupAll(rid);
    // if (this.presentRoom?.rid === rid) {
    // }
  }

  kick(rid: string, peer: Patp) {
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        kick: {
          rid,
          ship: peer,
        },
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
    console.log('getting rooms', this.rooms);
    return Array.from(this.rooms.values())
      .filter((room) => room.path === path)
      .filter((room) => room.type === 'rooms');
  }

  async getRoom(rid: string): Promise<RoomType> {
    const room = this.rooms.get(rid);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  /**
   * sendData - Send data to all peers
   * @param data: DataPacket
   */
  sendData(rid: string, data: Partial<DataPacket>) {
    const payload = { from: this.local?.patp, ...data } as DataPacket;
    this.peers.get(rid)?.forEach((peer) => {
      if (peer.status === PeerConnectionState.Connected) {
        peer.sendData(payload);
      }
    });
  }

  /**
   * sendChat - Send data to all peers
   * @param data: DataPacket
   */
  /*sendChat(content: string) {
    this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'send-chat': content,
      },
    });
  }*/

  dial(rid: string, peer: Patp, isHost: boolean): RemotePeer {
    if (!this.local) {
      throw new Error('No local peer created');
    }

    const peerConfig = {
      isHost,
      isInitiator: isDialer(this.local.patp, peer),
      rtc: this.rtc,
    };
    const remotePeer = new RemotePeer(
      this.our,
      peer,
      peerConfig,
      this.sendSignal,
      rid
    );

    this.peers.get(rid)?.set(remotePeer.patp, remotePeer);
    remotePeer.dial();
    // When we connect, lets stream our local tracks to the remote peer
    remotePeer.on(PeerEvent.Connected, () => {
      this.local?.streamTracks(remotePeer);
      this.sendData(rid, {
        kind: DataPacket_Kind.MUTE_STATUS,
        value: { data: this.local?.isMuted },
      });
    });

    remotePeer.on(PeerEvent.ReceivedData, (data: DataPacket) => {
      if (data.kind === DataPacket_Kind.MUTE_STATUS) {
        const payload = data.value as DataPayload;
        if (payload.data) {
          remotePeer.mute();
        } else {
          remotePeer.unmute();
        }
      } else if (data.kind === DataPacket_Kind.SPEAKING_CHANGED) {
        const payload = data.value as DataPayload;
        remotePeer.isSpeakingChanged(payload.data);
      } else {
        this.emit(
          ProtocolEvent.PeerDataReceived,
          data.rid,
          remotePeer.patp,
          data
        );
      }
    });

    this.emit(ProtocolEvent.PeerAdded, rid, remotePeer);

    return remotePeer;
  }

  async dialAll(room: RoomType): Promise<Map<string, Map<Patp, RemotePeer>>> {
    const peers = room.present.filter((peer: Patp) => this.our !== peer);
    await Promise.all(
      peers.map((peer: Patp) =>
        this.dial(room.rid, peer, peer === room.creator)
      )
    );
    return this.peers;
  }

  retry(rid: string, peer: Patp) {
    const remotePeer = this.peers.get(rid)?.get(peer);
    if (remotePeer) {
      remotePeer.dial();
      // this.sendSignal(peer, { type: 'retry', from: this.our });
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

  hangup(rid: string, peer: Patp, { shouldEmit } = { shouldEmit: true }) {
    const remotePeer = this.peers.get(rid)?.get(peer);
    if (remotePeer) {
      remotePeer.removeAllListeners();
      remotePeer.hangup();
      shouldEmit && this.emit(ProtocolEvent.PeerRemoved, rid, remotePeer);
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
    this.disposePresentRoom && this.disposePresentRoom();
    //  hangup all peers
    this.peers.get(rid)?.forEach((peer) => {
      this.hangup(rid, peer.patp, { shouldEmit: false });
    });
    this.peers.clear();
  }

  async leave(rid: string) {
    this.hangupAll(rid);
    this.peers.get(rid)?.clear();
    const room = this.rooms.get(rid);
    if (room) {
      this.transitions.leaving = room;
      this.emit(ProtocolEvent.RoomLeft, room);
    }
    await this.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'leave-room': rid,
      },
    });
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
