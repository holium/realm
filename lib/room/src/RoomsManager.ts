import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp, RoomState, RoomType } from './types';
import { BaseProtocol } from './connection/BaseProtocol';
import { RoomInstance } from './RoomInstance';
import { LocalPeer } from './peer/LocalPeer';
import { ProtocolEvent } from './connection/events';
import { DataPacket } from './helpers/data';
import { RoomManagerEvent } from './events';

/**
 * RoomsManager: top level class for managing the rooms primitive
 */
export class RoomsManager extends (EventEmitter as new () => TypedEmitter<RoomsManagerEventCallbacks>) {
  local: LocalPeer;
  protocol: BaseProtocol;
  presentRoom?: RoomInstance;

  constructor(protocol: BaseProtocol) {
    // eslint-disable-next-line constructor-super
    super();
    this.protocol = protocol;
    this.local = new LocalPeer(this.protocol, this.protocol.our, {
      isHost: false,
      rtc: this.protocol.rtc,
    });
    this.protocol.registerLocal(this.local);
    this.protocol.on(ProtocolEvent.RoomInitial, (room: RoomType) => {
      this.enterRoom(room.rid);
    });

    this.protocol.on(ProtocolEvent.RoomCreated, (room: RoomType) => {
      // When we create a room, we should enter it instantly
      if (room.creator === this.our) {
        this.enterRoom(room.rid);
      }
    });

    this.protocol.on(ProtocolEvent.RoomDeleted, (rid: string) => {
      // if we're in a deleted room, we should leave it
      if (this.presentRoom?.rid === rid) {
        this.presentRoom = undefined;
      }
    });

    this.protocol.on(ProtocolEvent.RoomKicked, (rid: string) => {
      // if we're in a kicked room, we should leave it
      this.leaveRoom(rid);
    });

    this.protocol.on(
      ProtocolEvent.PeerDataReceived,
      (peer: Patp, data: DataPacket) => {
        if (this.presentRoom) {
          this.emit(
            RoomManagerEvent.OnDataChannel,
            this.presentRoom.rid,
            peer,
            data
          );
        }
      }
    );

    makeObservable(this, {
      protocol: observable,
      presentRoom: observable,
      createRoom: action.bound,
      deleteRoom: action.bound,
      enterRoom: action.bound,
      leaveRoom: action.bound,
    });
  }

  get our(): Patp {
    return this.local.patp;
  }

  get currentRoom(): RoomInstance | undefined {
    return this.presentRoom;
  }

  get currentProtocol(): BaseProtocol {
    return this.protocol;
  }

  get rooms(): RoomType[] {
    return Array.from(this.protocol.rooms.values());
  }

  // Setup audio
  async getAudioInputSources() {
    const devices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();
    return formSourceOptions(
      devices.filter((device: MediaDeviceInfo) => {
        return device.kind === 'audioinput';
      })
    );
  }

  async getAudioOutputSources() {
    const devices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();
    return formSourceOptions(
      devices.filter((device: MediaDeviceInfo) => {
        return device.kind === 'audiooutput';
      })
    );
  }

  async getVideoInputSources() {
    const devices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();
    return formSourceOptions(
      devices.filter((device: MediaDeviceInfo) => {
        return device.kind === 'videoinput';
      })
    );
  }

  setAudioInput(deviceId: string) {
    this.local.setAudioInputDevice(deviceId);
  }

  setProvider(provider: string) {
    if (this.presentRoom?.state === RoomState.Connected) {
      throw new Error('Must leave current room before switching providers');
    }
    this.protocol.setProvider(provider);
  }

  enterRoom(rid: string): RoomInstance {
    if (this.presentRoom) {
      if (this.presentRoom.room.creator === this.our) {
        this.deleteRoom(this.presentRoom.rid);
      } else {
        this.leaveRoom(this.presentRoom.rid);
      }
    }
    if (!this.rooms.find((room: RoomType) => room.rid === rid)) {
      throw new Error('Room not found');
    }
    if (rid === this.presentRoom?.rid) {
      return this.presentRoom;
    }
    this.local.enableMedia();
    // returns the list of rooms from the current provider
    this.presentRoom = new RoomInstance(rid, this.protocol);
    this.presentRoom.on(RoomState.Started, () => {
      this.presentRoom?.connect();
    });
    return this.presentRoom;
  }

  leaveRoom(rid: string) {
    if (this.presentRoom?.rid !== rid) {
      throw new Error('must be in the room to leave');
    }
    this.local.disableMedia();
    this.presentRoom.leave();
    this.presentRoom = undefined;
  }

  createRoom(title: string, access: 'public' | 'private', spacePath?: string) {
    // creates a room in the current provider
    this.protocol.createRoom(title, access, spacePath);
  }

  deleteRoom(rid: string) {
    // provider/admin action
    this.protocol.deleteRoom(rid);
  }

  sendData(data: any) {
    this.presentRoom?.sendData({ from: this.our, ...data });
  }
}

export type RoomsManagerEventCallbacks = {
  createdRoom: (room: RoomType) => void;
  deletedRoom: (rid: string, state: RoomState) => void;
  joinedRoom: (rid: string) => void;
  leftRoom: (rid: string) => void;
  setNewProvider: (provider: Patp, rooms: RoomType[]) => void;
  onDataChannel: (rid: string, peer: Patp, data: DataPacket) => void;
};

const formSourceOptions = (sources: MediaDeviceInfo[]) => {
  return sources.map((source) => {
    return {
      label: source.label,
      value: source.deviceId,
    };
  });
};
