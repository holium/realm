import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { ChatModelType, Patp, RoomState, RoomType } from './types';
import { BaseProtocol } from './connection/BaseProtocol';
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
  campfireProtocol: BaseProtocol;
  dataProtocol: BaseProtocol;
  live: {
    room?: RoomType;
    chat?: ChatModelType[];
  };
  connected: {
    room?: RoomType;
    chat?: ChatModelType[];
  }[];
  context: {
    path?: string;
    provider: Patp;
    list: RoomType[];
  };
  state: RoomState = RoomState.Disconnected;

  constructor(
    protocol: BaseProtocol,
    type: 'rooms' | 'campfire' | 'typing' = 'rooms'
  ) {
    super();
    this.type = type;
    this.protocol = protocol;
    this.local = new LocalPeer(this.protocol, this.protocol.our, {
      isHost: false,
      rtc: this.protocol.rtc,
      video: type === 'campfire',
    });

    this.live = {
      room: undefined,
      chat: [],
    };

    this.context = {
      path: undefined,
      provider: this.protocol.provider,
      list: Array.from(this.protocol.rooms.values()),
    };
    this.protocol.registerLocal(this.local);

    // Setting up listeners
    this.protocol.on(ProtocolEvent.RoomInitial, (room: RoomType) => {
      this.connectRoom(room.rid);
    });

    this.protocol.on(ProtocolEvent.RoomCreated, (room: RoomType) => {
      // When we create a room, we should enter it instantly
      if (room.creator === this.our) {
        this.joinRoom(room.rid);
      }
    });

    this.protocol.on(ProtocolEvent.RoomEntered, (room: RoomType) => {
      this.updateRoom(room);
    });

    this.protocol.on(ProtocolEvent.RoomUpdated, (room: RoomType) => {
      this.updateRoom(room);
    });

    this.protocol.on(ProtocolEvent.RoomLeft, (rid: string) => {
      this.clearRoom(rid);
    });

    this.protocol.on(ProtocolEvent.RoomDeleted, (rid: string) => {
      // if we're in a deleted room, we should leave it
      if (this.live.find((live) => live.room?.rid === rid)) {
        this.clearRoom(rid);
      }
    });

    this.protocol.on(ProtocolEvent.RoomKicked, (rid: string) => {
      this.clearRoom(rid);
    });

    this.protocol.on(
      ProtocolEvent.PeerDataReceived,
      (peer: Patp, data: DataPacket) => {
        if (this.live.find((live) => live.room?.rid === data.rid)) {
          this.emit(RoomManagerEvent.OnDataChannel, data.rid, peer, data);
        }
      }
    );

    this.cleanup = this.cleanup.bind(this);

    makeObservable(this, {
      state: observable,
      protocol: observable,
      live: observable,
      createRoom: action.bound,
      deleteRoom: action.bound,
      joinRoom: action.bound,
      leaveRoom: action.bound,
      updateRoom: action.bound,
      connectRoom: action.bound,
      clearRoom: action.bound,
    });
  }

  cleanup() {
    for (let live of this.live) {
      if (live.room?.provider === this.our) {
        return this.deleteRoom(live.room?.rid);
      } else {
        return this.leaveRoom();
      }
    }
    return Promise.resolve();
  }

  /**
   * mute - Mutes local peer
   */
  mute() {
    this.protocol.local?.mute();
  }

  /**
   * unmute - Unmutes local peer
   */
  unmute() {
    this.protocol.local?.unmute();
  }

  /**
   * muteStatus - Returns mute status of local peer
   */
  get muteStatus() {
    return this.protocol.local?.isMuted;
  }

  get our(): Patp {
    return this.local.patp;
  }

  get presentRoom(): RoomType | null {
    return this.protocol.presentRoom;
  }

  /**
   * peers - Returns all peers
   * @returns RemotePeer[]
   */
  get peers() {
    return Array.from(this.protocol.peers.values());
  }

  get rooms(): RoomType[] {
    return Array.from(this.protocol.rooms.values());
  }

  get currentProtocol(): BaseProtocol {
    return this.protocol;
  }

  /*sendChat(content: string) {
    this.live.chat.push({
      author: this.protocol.our,
      index: this.live.chat.length,
      content,
      timeReceived: Date.now(),
      isRightAligned: true,
    });
    this.protocol.sendChat(content);
  }

  onChat(peer: Patp, content: string) {
    this.live.chat.push({
      author: peer,
      index: this.live.chat.length,
      content,
      timeReceived: Date.now(),
      isRightAligned: false,
    });
  }*/

  setProvider(provider: string) {
    // if (this.state === RoomState.Connected) {
    //   throw new Error('Must leave current room before switching providers');
    // }
    this.protocol.setProvider(provider);
  }

  joinRoom(rid: string) {
    if (!this.rooms.find((room: RoomType) => room.rid === rid)) {
      throw new Error('Room not found');
    }
    if (rid === this.presentRoom?.rid) {
      return;
    }
    this.connectRoom(rid);
  }

  connectRoom(rid: string) {
    this.local.enableMedia();
    // returns the list of rooms from the current provider
    this.getRoom(rid).then(
      action(() => {
        this.state = RoomState.Started;
        this.emit(RoomState.Started);
      })
    );
  }

  async getRoom(rid: string) {
    const room = await this.protocol.getRoom(rid);
    this.updateRoom(room);
    this.protocol.connect(room);
  }

  updateRoom(room: RoomType) {
    const live = this.live.find((live) => live.room?.rid === room.rid);
    if (live?.room) {
      Object.assign(live.room, room);
    }
  }

  async leaveRoom() {
    if (this.presentRoom) {
      this.emit(RoomManagerEvent.LeftRoom, this.presentRoom.rid, this.our);
      await this.protocol.leave(this.presentRoom.rid);
      this.clearRoom(this.presentRoom.rid);
    }
  }

  createRoom(title: string, access: 'public' | 'private', path: string | null) {
    // creates a room in the current provider
    const room = this.protocol.createRoom(title, access, path);
    this.emit(RoomManagerEvent.CreatedRoom, room);
  }

  async deleteRoom(rid: string) {
    // provider/admin action
    if (this.presentRoom?.rid === rid) {
      this.emit(RoomManagerEvent.DeletedRoom, rid);
      this.clearRoom(rid);
    }
    await this.protocol.deleteRoom(rid);
  }

  sendData(data: Omit<DataPacket, 'from'>) {
    this.protocol.sendData({ from: this.our, ...data });
  }

  // clear this.live element that has member type === 'rooms'
  clearRoom(rid: string) {
    let room = this.live.find((live) => live.room?.rid === rid);
    if (room) {
      this.live.splice(this.live.indexOf(room), 1);
    }
    this.local.disableMedia();
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

  setVideoInput(deviceId: string) {
    this.local.setVideoInputDevice(deviceId);
  }
}

export type RoomsManagerEventCallbacks = {
  started: () => void;
  connected: () => void;
  createdRoom: (room: RoomType) => void;
  deletedRoom: (rid: string) => void;
  joinedRoom: (rid: string, patp: Patp) => void;
  leftRoom: (rid: string, patp: Patp) => void;
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
