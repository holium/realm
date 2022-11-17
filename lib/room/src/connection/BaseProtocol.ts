import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';

import { Patp } from '../types';
import { RoomType } from '../types';
import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';

type AgentConnectParams = [RoomType];
type LocalCommsParams = [RoomType];

export type ProtocolConfig = { rtc: RTCConfiguration };

export abstract class BaseProtocol extends (EventEmitter as new () => TypedEmitter<ProtocolEventCallbacks>) {
  our: Patp;
  local?: LocalPeer;
  provider: string; // default is our
  presentRoom?: RoomType;
  rooms: RoomType[];
  peers: Map<Patp, RemotePeer> = new Map();
  rtc: RTCConfiguration = {
    iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
    iceTransportPolicy: 'relay',
  };

  constructor(our: Patp, config: ProtocolConfig, rooms: RoomType[] = []) {
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
      setProvider: action.bound,
      getRoom: action.bound,
      getRooms: action.bound,
      connect: action.bound,
      dial: action.bound,
      leave: action.bound,
    });
  }
  abstract registerLocal(local: LocalPeer): void;
  abstract setProvider(provider: Patp): Promise<RoomType[]>;
  abstract getRoom(rid: string): Promise<RoomType>;
  abstract getRooms(): Promise<RoomType[]>;
  //
  abstract connect(
    ...args: AgentConnectParams | LocalCommsParams
  ): Promise<Map<Patp, RemotePeer>>;
  abstract dial(peer: Patp, isHost: boolean): Promise<RemotePeer>;
  abstract leave(): Promise<void>;
  abstract sendSignal(peer: Patp, msg: any): void;
}

export type ProtocolEventCallbacks = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
};
