import { LocalPeer, RealmProtocol, RoomType } from '@holium/realm-room';
import { Instance, types, cast, flow } from 'mobx-state-tree';
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
    kickShip(patp: string) {
      self.present.remove(patp);
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

let protocol: RealmProtocol | null;
let local: LocalPeer | null;

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
            urls: 'turn:coturn.holium.live:443?transport=tcp',
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
  .actions((self) => ({
    init: flow(function* () {
      if (protocol) {
        protocol.cleanup();
      }
      self.rooms.clear();
      self.chat.clear();
      self.current = undefined;
      const handlers = {
        scry: RoomsIPC.scry as (...args: any[]) => Promise<any>,
        poke: RoomsIPC.poke as (...args: any[]) => Promise<any>,
      };
      protocol = new RealmProtocol(window.ship, self.config, handlers);
      local = new LocalPeer(protocol, window.ship, {
        isHost: false,
        rtc: protocol.rtc,
      });
      protocol.registerLocal(local);
      const session = yield RoomsIPC.getSession();
      if (session) {
        self.provider = session.provider;
        self.rooms = session.rooms;
        if (session.current) {
          local.enableMedia();
          self.current = self.rooms.get(session.current);
        }
      }
    }),
    createRoom(
      name: string,
      access: 'public' | 'private',
      spacePath?: string | null
    ) {
      if (!protocol || !local) return;
      try {
        const newRoom = protocol.createRoom(
          name,
          access,
          spacePath
        ) as RoomMobx;
        SoundActions.playRoomEnter();
        local.enableMedia();
        self.rooms.set(newRoom.rid, cast(newRoom));
        self.current = self.rooms.get(newRoom.rid);
      } catch (e) {
        console.error(e);
      }
    },
    joinRoom(rid: string) {
      const room = self.rooms.get(rid);
      if (room) {
        SoundActions.playRoomEnter();
        self.current = room;
        local?.enableMedia();
        protocol?.connect(room);
      } else {
        console.error('Room not found');
      }
    },
    leaveRoom() {
      if (!protocol) return;
      if (!self.current) return;
      protocol.leave(self.current.rid);
      self.current = undefined;
      SoundActions.playRoomLeave();
    },
    deleteRoom(rid: string) {
      const room = self.rooms.get(rid);
      if (room) {
        self.current = undefined;
        self.rooms.delete(rid);
        protocol?.deleteRoom(rid);
        SoundActions.playRoomLeave();
      } else {
        console.error('Room not found');
      }
    },
    // Peer handling
    retryPeer(patp: string) {
      if (!protocol) return;
      protocol.retry(patp);
    },
    kickPeer(patp: string) {
      if (!protocol) return;
      protocol.kick(patp);
    },
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
        local?.enableMedia();
        self.current = self.rooms.get(session.current);
      }
    },
  }))
  .views((self) => ({
    getSpaceRooms(path: string) {
      return Array.from(self.rooms.values()).filter(
        (room) => room.path === path
      );
    },
    getPeer(patp: string) {
      if (!protocol) return;
      if (patp === window.ship) return local;
      return protocol.peers.get(patp);
    },
    get peers() {
      return Array.from(protocol?.peers.keys() || []);
    },
    get roomsList() {
      return Array.from(self.rooms.values());
    },
    get isMuted() {
      return local?.isMuted;
    },
  }));

export type RoomsMobxType = Instance<typeof RoomsStore>;

RoomsIPC.onUpdate(({ mark, type, payload }) => {
  console.log('RoomsIPC onUpdate', mark, type, payload);
  if (type === 'session') {
    shipStore.roomsStore._onSession(payload);
  }

  if (protocol) {
    if (type === 'room-entered') {
      SoundActions.playRoomPeerEnter();
    }
    if (type === 'room-left') {
      SoundActions.playRoomPeerLeave();
    }
    protocol.onSignal(payload, type);
  }
});

window.addEventListener('beforeunload', () => {
  if (protocol) {
    protocol.cleanup();
  }
  local?.disableMedia();
});
