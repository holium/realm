import { PeerEvent } from './../peer/events';
import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { action, makeObservable, observable, toJS } from 'mobx';

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
  constructor(our: Patp, config: ProtocolConfig, shipConfig: ShipConfig) {
    super(our, config);
    this.shipConfig = shipConfig;

    makeObservable(this, {
      api: observable,
      dialAll: action.bound,
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
    this.api?.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-signal',
      json: {
        signal: { from: this.local?.patp, to: peer, data: JSON.stringify(msg) },
      },
    });
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
          this.emit(ProtocolEvent.RoomInitial, currentRoom);
        }
      }
    }

    if (mark === 'rooms-v2-signal') {
      console.log('room agent signal', data);
      if (data['signal']) {
        const payload = data['signal'];
        const sender = this.peers.get(payload.from);
        if (sender) {
          sender?.peer.signal(payload.data);
        } else {
          if (this.presentRoom?.present.includes(payload.from)) {
            // this is a new peer
            this.dial(payload.from, payload.data);
          }
          console.warn('Received signal from unknown peer');
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
        console.log('on room deleted reaction', payload, toJS(room));
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
          if (payload.ship !== this.our) {
            this.dial(payload.ship, payload.ship === room.creator);
          } else {
            this.emit(ProtocolEvent.RoomEntered, payload.rid);
          }
        }
      }
      if (data['room-left']) {
        const payload = data['room-left'];
        const room = this.rooms.get(payload.rid);
        if (room) {
          room?.present.splice(room.present.indexOf(payload.ship), 1);
          this.rooms.set(payload.rid, room);
          if (payload.ship !== this.our) {
            this.hangup(payload.ship);
          }
        }
      }
      if (data['room-created']) {
        const { room } = data['room-created'];
        this.rooms.set(room.rid, room);
        if (room.creator === this.our && this.presentRoom !== room.rid) {
          this.emit(ProtocolEvent.RoomCreated, room);
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
      space: '',
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
    console.log('getting rooms');
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
    // When we connect, lets stream our local tracks to the remote peer
    remotePeer.on(PeerEvent.Connected, () => {
      this.local?.streamTracks(remotePeer);
    });

    return remotePeer;
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
    }
    this.peers.delete(peer);
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
    this.peers.clear();
  }

  async leave() {
    if (!this.presentRoom) {
      throw new Error('No room to leave');
    }
    if (this.presentRoom.present.includes(this.our)) {
      await this.api?.poke({
        app: 'rooms-v2',
        mark: 'rooms-v2-session-action',
        json: {
          'leave-room': this.presentRoom.rid,
        },
      });
    }
    this.peers.clear();
    this.presentRoom = undefined;
  }
}
