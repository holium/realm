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
  campfireLocal: LocalPeer;
  dataLocal: LocalPeer;
  protocol: BaseProtocol;
  live: {
    room?: RoomType;
    chat?: ChatModelType[];
  };
  // campfire rooms are provided one at a time, not shared as rooms
  campfire: {
    room?: RoomType;
    chat?: ChatModelType[];
  };
  // data rooms auto-connect to a set of patps
  dataRooms: { [rid: string]: RoomType } = {};
  context: {
    path?: string;
    provider: Patp;
    list: RoomType[];
  };
  state: RoomState = RoomState.Disconnected;
  campfireState: RoomState = RoomState.Disconnected;
  dataStates: { [rid: string]: RoomState } = {};

  constructor(protocol: BaseProtocol) {
    super();
    this.protocol = protocol;
    this.local = new LocalPeer(this.protocol, this.protocol.our, {
      isHost: false,
      rtc: this.protocol.rtc,
      audio: true,
      video: false,
    });
    this.campfireLocal = new LocalPeer(this.protocol, this.protocol.our, {
      isHost: false,
      rtc: this.protocol.rtc,
      audio: true,
      video: true,
    });
    this.dataLocal = new LocalPeer(this.protocol, this.protocol.our, {
      isHost: false,
      rtc: this.protocol.rtc,
      audio: false,
      video: false,
    });

    this.live = {
      room: undefined,
      chat: [],
    };
    this.campfire = {
      room: undefined,
      chat: [],
    };

    this.context = {
      path: undefined,
      provider: this.protocol.provider,
      list: Array.from(this.protocol.rooms.values()),
    };

    this.protocol.registerLocals(
      this.local,
      this.campfireLocal,
      this.dataLocal
    );

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

    this.protocol.on(ProtocolEvent.RoomLeft, (room: RoomType) => {
      if (room.type === 'rooms') {
        this.clearLiveRoom();
      } else if (room.type === 'campfire') {
        this.clearCampfireRoom();
      } else if (room.type === 'data') {
        this.clearDataRoom(room.rid);
      }
    });

    this.protocol.on(ProtocolEvent.RoomDeleted, (rid: string) => {
      if (this.live.room?.rid === rid) {
        this.clearLiveRoom();
      } else if (this.campfire.room?.rid === rid) {
        this.clearCampfireRoom();
      } else if (this.dataRooms[rid]) {
        this.clearDataRoom(rid);
      }
    });

    this.protocol.on(ProtocolEvent.RoomKicked, () => {
      this.clearLiveRoom();
    });

    this.protocol.on(
      ProtocolEvent.PeerDataReceived,
      (rid: string, peer: Patp, data: DataPacket) => {
        if (this.live.room) {
          this.emit(RoomManagerEvent.OnDataChannel, rid, peer, data);
        }
      }
    );

    this.cleanup = this.cleanup.bind(this);

    makeObservable(this, {
      state: observable,
      campfireState: observable,
      dataStates: observable,
      protocol: observable,
      live: observable,
      campfire: observable,
      dataRooms: observable,
      createRoom: action.bound,
      deleteRoom: action.bound,
      joinRoom: action.bound,
      leaveRoom: action.bound,
      updateRoom: action.bound,
      connectRoom: action.bound,
    });
  }

  cleanup() {
    if (this.live.room) {
      if (this.live.room.creator === this.our) {
        return this.deleteRoom(this.live.room.rid);
      } else {
        return this.leaveRoom();
      }
    }
    for (let dataRoom of Object.values(this.dataRooms)) {
      if (dataRoom.provider === this.our) {
        return this.deleteRoom(dataRoom.rid);
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

  get presentCampfire(): RoomType | null {
    return this.protocol.presentCampfire;
  }

  get presentData(): Map<string, RoomType> {
    return this.protocol.presentData;
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

  setProvider(provider: string) {
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
    if (room.type === 'rooms') {
      console.log('setting rooms room');
      this.live.room = room;
    } else if (room.type === 'campfire') {
      console.log('setting campfire room');
      this.campfire.room = room;
    } else if (room.type === 'data') {
      console.log('setting data room');
      this.dataRooms[room.rid] = room;
    }
  }

  async leaveRoom() {
    if (this.presentRoom) {
      this.emit(
        RoomManagerEvent.LeftRoom,
        this.presentRoom,
        this.presentRoom.rid,
        this.our
      );
      await this.protocol.leave(this.presentRoom.rid);
    }
    this.clearLiveRoom();
  }

  async leaveCampfire() {
    if (this.presentCampfire) {
      this.emit(
        RoomManagerEvent.LeftRoom,
        this.presentCampfire,
        this.presentCampfire.rid,
        this.our
      );
      await this.protocol.leave(this.presentCampfire.rid);
    }
    this.clearCampfireRoom();
  }

  createRoom(
    title: string,
    access: 'public' | 'private',
    path: string | null,
    type: 'rooms' | 'campfire' | 'data' = 'rooms'
  ) {
    // creates a room in the current provider
    if (type === 'rooms') {
      if (this.presentRoom) {
        this.protocol.deleteRoom(this.presentRoom.rid);
      }
    }
    if (type === 'campfire') {
      if (this.presentCampfire) {
        this.protocol.deleteRoom(this.presentCampfire.rid);
      }
    }
    const room = this.protocol.createRoom(title, access, path, type);
    this.emit(RoomManagerEvent.CreatedRoom, room);
  }

  async deleteRoom(rid: string) {
    if (this.presentRoom?.rid === rid) {
      console.log('deleting presentRoom');
      this.emit(RoomManagerEvent.DeletedRoom, this.presentRoom);
      this.clearLiveRoom();
    }
    if (this.presentCampfire?.rid === rid) {
      console.log('deleting campfire blah');
      this.emit(RoomManagerEvent.DeletedRoom, this.presentCampfire);
      this.clearCampfireRoom();
    }
    await this.protocol.deleteRoom(rid);
  }

  sendData(rid: string, data: Omit<DataPacket, 'from'>) {
    this.protocol.sendData(rid, { from: this.our, ...data });
  }

  clearLiveRoom() {
    this.live.room = undefined;
    this.live.chat = [];
  }

  clearCampfireRoom() {
    this.campfire.room = undefined;
    this.campfire.chat = [];
  }

  clearDataRoom(rid: string) {
    delete this.dataRooms[rid];
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
  deletedRoom: (room: RoomType) => void;
  joinedRoom: (rid: string, patp: Patp) => void;
  leftRoom: (room: RoomType, rid: string, patp: Patp) => void;
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
