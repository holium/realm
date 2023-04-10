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
  campfireLocal: LocalPeer | null = null;
  dataLocal: LocalPeer | null = null;
  provider: string; // default is our
  presentRoom: RoomType | null = null;
  presentCampfire: RoomType | null = null;
  presentData: Map<string, RoomType> = new Map();
  rooms: RoomMap;
  peers: Map<string, Map<Patp, RemotePeer>> = new Map();
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
      campfireLocal: observable,
      dataLocal: observable,
      peers: observable,
      presentRoom: observable,
      presentCampfire: observable,
      presentData: observable,
      rooms: observable,
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
    path: string | null,
    type: 'rooms' | 'campfire' | 'data'
  ): RoomType;
  abstract deleteRoom(rid: string): Promise<void>;
  abstract getRoom(rid: string): Promise<RoomType>;
  abstract getRooms(): Promise<RoomType[]>;
  //
  abstract connect(
    ...args: AgentConnectParams | LocalCommsParams
  ): Promise<Map<string, Map<Patp, RemotePeer>>>;
  abstract dial(rid: string, peer: Patp, isHost: boolean): RemotePeer;
  abstract kick(rid: string, peer: Patp): void;
  abstract leave(rid: string): Promise<void>;
  abstract sendSignal(rid: string, peer: Patp, msg: any): void;
  abstract sendData(rid: string, data: DataPacket): void;
}

export type ProtocolEventCallbacks = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (rid: string, host: Patp) => void;
  peerAdded: (rid: string, peer: RemotePeer) => void;
  peerRemoved: (rid: string, peer: RemotePeer) => void;
  creatingRoom: (room: RoomType) => void;
  roomCreated: (room: RoomType) => void;
  roomDeleted: (rid: string) => void;
  roomKicked: (rid: string) => void;
  roomUpdated: (room: RoomType) => void;
  roomInitial: (room: RoomType) => void;
  roomEntered: (room: RoomType) => void;
  roomLeft: (room: RoomType) => void;
  peerDataReceived: (rid: string, peer: Patp, data: DataPacket) => void;
};
