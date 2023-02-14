import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';

import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';
import { Patp, RoomMap, RoomType } from '../types';
import { DataPacket } from '../helpers/data';

type AgentConnectParams = [RoomType];
type LocalCommsParams = [RoomType];

export interface ProtocolConfig {
  rtc: RTCConfiguration;
}

export abstract class BaseProtocol extends (EventEmitter as new () => TypedEmitter<ProtocolEventCallbacks>) {
  our: Patp;
  local: LocalPeer | null = null;
  provider: string; // default is our
  presentRoom: RoomType | null = null;
  rooms: RoomMap;
  peers: Map<Patp, RemotePeer> = new Map();
  rtc: RTCConfiguration = {
    iceServers: [
      {
        username: 'realm',
        credential: 'zQzjNHC34Y8RqdLW',
        urls: 'turn:coturn.holium.live:3478',
      },
    ],
  };

  constructor(our: Patp, config: ProtocolConfig, rooms: RoomMap = new Map()) {
    super();
    this.our = our;
    this.provider = our;
    this.rooms = rooms;
    this.rtc = config.rtc;
    makeObservable(this, {
      provider: observable,
      local: observable,
      peers: observable,
      rooms: observable,
      presentRoom: observable,
      setProvider: action.bound,
      getRoom: action.bound,
      getRooms: action.bound,
      connect: action.bound,
      dial: action.bound,
      kick: action.bound,
      leave: action.bound,
    });
  }
  abstract registerLocal(local: LocalPeer): void;
  abstract setProvider(provider: Patp): Promise<RoomType[]>;
  abstract createRoom(
    title: string,
    access: 'public' | 'private',
    path: string | null
  ): RoomType;
  abstract deleteRoom(rid: string): Promise<void>;
  abstract getRoom(rid: string): Promise<RoomType>;
  abstract getRooms(): Promise<RoomType[]>;
  //
  abstract connect(
    ...args: AgentConnectParams | LocalCommsParams
  ): Promise<Map<Patp, RemotePeer>>;
  abstract dial(peer: Patp, isHost: boolean): RemotePeer;
  abstract kick(peer: Patp): void;
  abstract leave(rid: string): Promise<void>;
  abstract sendSignal(peer: Patp, msg: any): void;
  abstract sendData(data: DataPacket): void;
  abstract sendChat(content: string): void;
}

export type ProtocolEventCallbacks = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
  peerAdded: (peer: RemotePeer) => void;
  peerRemoved: (peer: RemotePeer) => void;
  creatingRoom: (room: RoomType) => void;
  roomCreated: (room: RoomType) => void;
  roomDeleted: (rid: string) => void;
  roomKicked: (rid: string) => void;
  roomUpdated: (room: RoomType) => void;
  roomInitial: (room: RoomType) => void;
  roomEntered: (room: RoomType) => void;
  roomLeft: (room: RoomType) => void;
  peerDataReceived: (peer: Patp, data: DataPacket) => void;
  chatReceived: (peer: Patp, content: string) => void;
};
