import { observable } from 'mobx';
import { cast, flow, Instance, types } from 'mobx-state-tree';
import { patp2dec } from 'urbit-ob';

import {
  DataPacket,
  DataPacket_Kind,
  DataPayload,
  LocalPeer,
  PeerConnectionState,
  PeerEvent,
  RemotePeer,
  ridFromTitle,
} from '@holium/realm-room';

import { SoundActions } from 'renderer/lib/sound';

import { RoomsIPC } from './ipc';
import { shipStore } from './ship.store';

export const RoomModel = types
  .model('RoomModel', {
    rid: types.identifier,
    provider: types.string,
    creator: types.string,
    access: types.string,
    title: types.string,
    present: types.array(types.string),
    whitelist: types.array(types.string),
    capacity: types.integer,
    path: types.string,
  })
  .actions((self) => ({
    addPeer(patp: string) {
      self.present.push(patp);
    },
    removePeer(patp: string) {
      self.present.remove(patp);
    },
    addWhitelist(patp: string) {
      self.whitelist.push(patp);
    },
    removeWhitelist(patp: string) {
      self.whitelist.remove(patp);
    },
  }));
//
export type RoomMobx = Instance<typeof RoomModel>;

export const ChatModel = types.model('ChatModel', {
  index: types.integer,
  author: types.string,
  contents: types.string,
  isRightAligned: types.boolean,
  timeReceived: types.integer,
});
export type RoomChatMobx = Instance<typeof ChatModel>;

let local: LocalPeer | null;
let peers: Map<string, RemotePeer> = observable(new Map());
let queuedPeers: string[] = observable([]); // peers that we have queued to dial

export function isInitiator(localPatpId: number, remotePatp: string) {
  return localPatpId < patp2dec(remotePatp);
}

export function isDialer(localPatp: string, remotePatp: string) {
  return localPatp < remotePatp;
}

const sendData = (data: Partial<DataPacket>) => {
  const payload = { from: local?.patp, ...data } as DataPacket;
  peers.forEach((peer) => {
    if (peer.status === PeerConnectionState.Connected) {
      peer.sendData(payload);
    }
  });
};

const dialPeer = (
  rid: string,
  from: string,
  to: string,
  isHost: boolean,
  rtc: any
): RemotePeer => {
  if (!local) {
    throw new Error('No local peer created');
  }

  const peerConfig = {
    isHost,
    isInitiator: isDialer(from, to),
    rtc,
  };

  const remotePeer = new RemotePeer(
    from,
    to,
    peerConfig,
    local,
    (peer: string, data: any) => {
      RoomsIPC.sendSignal(window.ship, peer, rid, data);
    }
  );

  peers.set(remotePeer.patp, remotePeer);
  remotePeer.dial();
  // When we connect, lets stream our local tracks to the remote peer
  remotePeer.on(PeerEvent.Connected, () => {
    console.log('!!!CONNECTED to peer', remotePeer.patp);
    if (!local) {
      throw new Error('No local peer created');
    }
    local.streamTracks(remotePeer);
    sendData({
      kind: DataPacket_Kind.MUTE_STATUS,
      value: { data: local?.isMuted },
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
      // this.emit(ProtocolEvent.PeerDataReceived, remotePeer.patp, data);
    }
  });

  // this.emit(ProtocolEvent.PeerAdded, remotePeer);

  return remotePeer;
};

const dialAll = (
  our: string,
  room: RoomMobx,
  rtc: any
): Map<string, RemotePeer> => {
  const presentPeers = room.present.filter((peer: string) => our !== peer);
  presentPeers.forEach((peer: string) => {
    // console.log('dialing peer', peer, rtc);
    dialPeer(room.rid, our, peer, false, rtc);
  });

  return peers;
};

const hangup = (peer: string) => {
  const remotePeer = peers.get(peer);
  if (remotePeer) {
    remotePeer.removeAllListeners();
    remotePeer.hangup();
    peers.delete(peer);
  }
};

const hangupAll = () => {
  peers.forEach((peer) => {
    hangup(peer.patp);
  });
  peers.clear();
  local?.disableMedia();
};

export const RoomsStore = types
  .model('RoomsStore', {
    path: types.optional(types.string, ''),
    provider: types.optional(types.string, ''),
    rooms: types.map(RoomModel),
    chat: types.array(ChatModel),
    current: types.maybe(types.reference(RoomModel)),
    config: types.optional(types.frozen(), {
      rtc: {
        iceServers: [
          {
            username: 'realm',
            credential: 'zQzjNHC34Y8RqdLW',
            urls: 'turn:coturn.holium.live:3478?transport=tcp',
          },
          {
            username: 'realm',
            credential: 'zQzjNHC34Y8RqdLW',
            urls: 'turn:coturn.holium.live:3478?transport=udp',
          },
        ],
      },
    }),
  })
  .views((self) => ({
    getSpaceRooms(path: string) {
      return Array.from(self.rooms.values()).filter(
        (room) => room.path === path
      );
    },
    getPeer(patp: string) {
      if (patp === window.ship) return local;
      return peers.get(patp);
    },
    get peers() {
      return Array.from(peers.keys() || []);
    },
    get roomsList() {
      return Array.from(self.rooms.values());
    },
    get isMuted() {
      return local?.isMuted;
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      // self.rooms.clear();
      // self.chat.clear();
      // self.current = undefined;
      // Doing this all in one place
      local = observable(
        new LocalPeer(window.ship, {
          isHost: false,
          rtc: self.config.rtc,
        })
      );
      local.on(PeerEvent.AudioTrackAdded, () => {
        peers.forEach((peer: RemotePeer) => {
          local?.streamTracks(peer);
        });
      });
      local.on(PeerEvent.Muted, () => {
        sendData({
          kind: DataPacket_Kind.MUTE_STATUS,
          value: { data: true },
        });
      });
      local.on(PeerEvent.Unmuted, () => {
        sendData({
          kind: DataPacket_Kind.MUTE_STATUS,
          value: { data: false },
        });
      });
      local.on(PeerEvent.IsSpeakingChanged, (speaking: boolean) => {
        sendData({
          kind: DataPacket_Kind.SPEAKING_CHANGED,
          value: { data: speaking },
        });
      });
      const session = yield RoomsIPC.getSession();
      if (session) {
        self.provider = session.provider;
        self.rooms = session.rooms;
        if (session.current) {
          self.current = self.rooms.get(session.current);
          // local.enableMedia();
          // self.current && dialAll(window.ship, self.current, self.config.rtc);
        }
      }
    }),
    createRoom: flow(function* (
      title: string,
      access: 'public' | 'private',
      spacePath?: string | null
    ) {
      if (!local) return;
      try {
        const newRoom = RoomModel.create({
          rid: ridFromTitle(self.provider, window.ship, title),
          title,
          access,
          provider: self.provider,
          creator: window.ship,
          present: [window.ship],
          whitelist: [],
          capacity: 6,
          path: spacePath || '',
        });
        SoundActions.playRoomEnter();
        local.enableMedia();
        self.rooms.set(newRoom.rid, cast(newRoom));
        self.current = self.rooms.get(newRoom.rid);
        yield RoomsIPC.createRoom(
          newRoom.rid,
          newRoom.title,
          newRoom.access as 'public' | 'private',
          newRoom.path
        );
      } catch (e) {
        console.error(e);
      }
    }),
    joinRoom: flow(function* (rid: string) {
      const room = self.rooms.get(rid);
      if (room) {
        SoundActions.playRoomEnter();
        self.current = room;
        yield RoomsIPC.enterRoom(rid);
        local?.enableMedia();
        dialAll(window.ship, room, self.config.rtc);
      } else {
        console.error('Room not found');
      }
    }),
    leaveRoom: flow(function* () {
      if (!self.current) return;
      try {
        const currentRid = self.current.rid;
        self.current.removePeer(window.ship);
        self.current = undefined;
        yield RoomsIPC.leaveRoom(currentRid);
        hangupAll();
        SoundActions.playRoomLeave();
        peers.clear();
      } catch (e) {
        console.error(e);
      }
    }),
    deleteRoom: flow(function* (rid: string) {
      const room = self.rooms.get(rid);
      if (room) {
        self.current = undefined;
        self.rooms.delete(rid);
        yield RoomsIPC.deleteRoom(rid);
        hangupAll();
        SoundActions.playRoomLeave();
      } else {
        console.error('Room not found');
      }
    }),
    // Peer handling
    retryPeer(patp: string) {
      // protocol.retry(patp);
    },
    kickPeer: flow(function* (patp: string) {
      if (!self.current) return;
      yield RoomsIPC.kickPeer(self.current.rid, patp);
    }),
    // Local handling
    mute() {
      local?.mute();
    },
    unmute() {
      local?.unmute();
    },
    setAudioInput(deviceId: string) {
      local?.setAudioInputDevice(deviceId);
    },
    _onSession(session: any) {
      self.provider = session.provider;
      self.rooms = session.rooms;
      if (session.current) {
        self.current = self.rooms.get(session.current);
        // local?.enableMedia();
        // self.current && dialAll(window.ship, self.current, self.config.rtc);
      }
    },
    _onRoomCreated(room: RoomMobx) {
      self.rooms.set(room.rid, cast(room));
    },

    _onRoomEntered(rid: string, patp: string) {
      const room = self.rooms.get(rid);
      if (patp === window.ship && self.current?.rid !== rid) {
        self.current = room;
      }
      room?.addPeer(patp);
      if (self.current?.rid === rid) {
        // if we are in the room, dial the new peer
        if (peers.has(patp)) {
          console.log('!!!!!already have peer', patp);
        }
        if (patp !== window.ship) {
          const remotePeer = dialPeer(
            rid,
            window.ship,
            patp,
            room?.creator === window.ship,
            self.config.rtc
          );
          // queuedPeers are peers that are ready for us to dial them
          if (queuedPeers.includes(patp)) {
            // console.log('%room-entered in queuedPeer', patp);
            remotePeer.onWaiting();
            queuedPeers.splice(queuedPeers.indexOf(patp), 1);
          }
        } else {
          // this.emit(ProtocolEvent.RoomEntered, room);
          // this.transitions.entering = null;
        }
      }
    },
    _onRoomLeft(rid: string, patp: string) {
      const room = self.rooms.get(rid);
      if (patp === window.ship && self.current?.rid === rid) {
        self.current = undefined;
        // hangupAll();
      }
      if (patp !== window.ship) {
        room?.removePeer(patp);
        hangup(patp);
      }
    },
    _onKicked(rid: string, patp: string) {
      const room = self.rooms.get(rid);
      if (patp === window.ship && self.current?.rid === rid) {
        self.current = undefined;
        hangupAll();
      }
      if (patp !== window.ship) {
        room?.removePeer(patp);
        hangup(patp);
      }
    },
    _onRoomDeleted(rid: string) {
      if (self.current?.rid === rid) {
        self.current = undefined;
      }
      const room = self.rooms.get(rid);
      // console.log('_onRoomDeleted', room?.creator, window.ship);
      if (room?.creator !== window.ship) {
        // console.log('_onRoomDeleted someone else deleted');
        peers.forEach((peer) => {
          hangup(peer.patp);
        });
        peers.clear();
      }
      self.rooms.delete(rid);
    },
  }));

export type RoomsMobxType = Instance<typeof RoomsStore>;

let areListenersRegistered = false;
function registerOnUpdateListener() {
  if (areListenersRegistered) {
    console.log('onUpdate listener already registered.');
    return;
  }

  RoomsIPC.onUpdate(({ mark, type, payload }) => {
    if (mark === 'rooms-v2-view') {
      // console.log('rooms-v2-view', type, payload);
      if (type === 'session') {
        shipStore.roomsStore._onSession(payload);
      }
    }

    if (mark === 'rooms-v2-reaction') {
      // console.log('rooms-v2-reaction', type, payload);
      if (type === 'room-entered') {
        SoundActions.playRoomPeerEnter();
        // console.log(`%room-entered ${payload.ship}`);
        shipStore.roomsStore._onRoomEntered(payload.rid, payload.ship);
      }
      if (type === 'room-left') {
        shipStore.roomsStore._onRoomLeft(payload.rid, payload.ship);
      }
      if (type === 'room-created') {
        shipStore.roomsStore._onRoomCreated(payload.room);
      }
      if (type === 'room-deleted') {
        shipStore.roomsStore._onRoomDeleted(payload.rid);
      }
      if (type === 'kicked') {
        shipStore.roomsStore._onKicked(payload.rid, payload.ship);
        // SoundActions.playRoomPeerEnter();
      }
      if (type === 'chat-received') {
        // SoundActions.playRoomPeerEnter();
      }
      if (type === 'provider-changed') {
        // SoundActions.playRoomPeerLeave();
      }
    }
    if (mark === 'rooms-v2-signal') {
      const remotePeer = peers.get(payload.from);
      const signalData = JSON.parse(payload.data);
      // console.log('rooms-v2-signal', payload.from, signalData.type);

      if (signalData.type === 'waiting') {
        if (!remotePeer) {
          // console.log(`%waiting from unknown ${payload.from}`);
          queuedPeers.push(payload.from);
        } else {
          // console.log(`%waiting from ${payload.from}`);
          remotePeer.onWaiting();
        }
      }
      if (signalData.type === 'retry') {
        const retryingPeer = peers.get(payload.from);
        retryingPeer?.dial();
      }
      if (!['retry', 'ack-waiting', 'waiting'].includes(signalData.type)) {
        if (remotePeer) {
          // console.log(
          //   `%${JSON.parse(payload.data)?.type} from ${payload.from}`
          // );
          remotePeer.peerSignal(payload.data);
        } else {
          // console.log(
          //   `%${JSON.parse(payload.data)?.type} from unknown ${payload.from}`
          // );
        }
      }
    }
  });

  window.addEventListener('beforeunload', () => {
    console.log('rooms store cleanup');
    // local?.disableMedia();
    // peers.forEach((peer) => {
    //   peer.removeAudioTracks();
    // });
    // local = null;
  });

  areListenersRegistered = true;
}

registerOnUpdateListener();
