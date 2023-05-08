import { observable } from 'mobx';
import { applySnapshot, cast, flow, Instance, types } from 'mobx-state-tree';
import { io, Socket } from 'socket.io-client';
import { patp2dec } from 'urbit-ob';

import { SoundActions } from 'renderer/lib/sound';

import { RoomsIPC } from './ipc';
import { LocalPeer } from './rooms/LocalPeer';
import { RemotePeer } from './rooms/RemotePeer';
import { ridFromTitle } from './rooms/rooms.parsing';
import {
  DataPacket,
  DataPacketKind,
  PeerConnectionState,
} from './rooms/rooms.types';
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
  content: types.string,
  isRightAligned: types.boolean,
  timeReceived: types.integer,
});
export type RoomChatMobx = Instance<typeof ChatModel>;

export function isInitiator(localPatpId: number, remotePatp: string) {
  return localPatpId < patp2dec(remotePatp);
}

// create mobx enum from type

const PeerConnState = types.enumeration([
  'disconnected',
  'connecting',
  'connected',
  'failed',
  'new',
  'closed',
  'destroyed',
  'redialing',
  'broadcasting',
]);

const PeerMetadata = types
  .model('PeerMetadata', {
    isMuted: types.optional(types.boolean, false),
    isSpeaking: types.optional(types.boolean, false),
    isAudioAttached: types.optional(types.boolean, false),
    status: types.optional(PeerConnState, 'disconnected'),
  })
  .actions((self) => ({
    setMute(mute: boolean) {
      self.isMuted = mute;
    },
    setSpeaking(speaking: boolean) {
      self.isSpeaking = speaking;
    },
    setAudioAttached(attached: boolean) {
      self.isAudioAttached = attached;
    },
    setStatus(status: PeerConnectionState) {
      self.status = status;
    },
  }));

export const RoomsStore = types
  .model('RoomsStore', {
    path: types.optional(types.string, ''),
    provider: types.optional(types.string, ''),
    rooms: types.map(RoomModel),
    chat: types.array(ChatModel),
    current: types.maybe(types.reference(RoomModel)),
    isMuted: types.optional(types.boolean, false),
    isSpeaking: types.optional(types.boolean, false),
    isAudioAttached: types.optional(types.boolean, false),
    peersMetadata: types.map(PeerMetadata),
    status: types.optional(PeerConnState, 'connected'),
    rtcConfig: types.optional(types.frozen(), {
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
    }),
  })
  .views((self) => ({
    getSpaceRooms(path: string) {
      return Array.from(self.rooms.values()).filter(
        (room) => room.path === path
      );
    },
    get roomsList() {
      return Array.from(self.rooms.values());
    },
  }))
  .actions((self) => ({
    setMuted: (isMuted: boolean) => {
      self.isMuted = isMuted;
    },
    setSpeaking: (isSpeaking: boolean) => {
      self.isSpeaking = isSpeaking;
    },
    setAudioAttached: (isAttached: boolean) => {
      self.isAudioAttached = isAttached;
    },
    _onDataChannel(_payload: DataPacket) {
      // DON'T REMOVE this is an event handler for the data channel
      // it doesnt need to do anything, but it needs to exist in order
      // for onAction listeners to be called
    },
  }))
  .actions((self) => {
    let socket: undefined | Socket<any, any>;
    const localPeer = observable(new LocalPeer());
    const remotePeers = observable(new Map<string, RemotePeer>());
    const queuedPeers = observable([]) as string[]; // peers that we have queued to dial

    const sendDataToPeer = (data: Partial<DataPacket>) => {
      const payload = { from: localPeer?.patp, ...data } as DataPacket;
      remotePeers.forEach((peer) => {
        // console.log('sendDataToPeer ....', peer.patp, peer.status);
        if (peer.status === PeerConnectionState.Connected) {
          peer.sendData(payload);
        }
      });
    };

    const sendSignal = (to: string, rid: string, signal: any) => {
      socket?.emit('signal', { from: window.ship, to, rid, data: signal });
    };

    const dialPeer = (rid: string, to: string, rtc: any) => {
      if (!localPeer) {
        throw new Error('No local peer created');
      }
      const peerConfig = {
        isInitiator: isInitiator(localPeer.patpId, to),
        rtc,
      };
      const remotePeer = new RemotePeer(
        rid,
        to,
        localPeer,
        sendDataToPeer,
        sendSignal,
        {
          setAudioAttached: (isAttached: boolean) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            self.peersMetadata.get(to)?.setAudioAttached(isAttached);
          },
          setMuted: (isMuted: boolean) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            self.peersMetadata.get(to)?.setMute(isMuted);
          },
          setSpeaking: (isSpeaking: boolean) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            self.peersMetadata.get(to)?.setSpeaking(isSpeaking);
          },
          setStatus: (status: PeerConnectionState) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            self.peersMetadata.get(to)?.setStatus(status);
          },
          onDataChannel: self._onDataChannel,
        },
        peerConfig
      );
      remotePeers.set(remotePeer.patp, remotePeer);
      remotePeer.dial();
      return remotePeer;
    };
    const dialAll = (room: RoomMobx, rtc: RTCConfiguration) => {
      const presentPeers = room.present.filter(
        (peer: string) => window.ship !== peer
      );
      presentPeers.forEach((peer: string) => {
        dialPeer(room.rid, peer, rtc);
      });
    };

    const hangup = (peer: string) => {
      const remotePeer = remotePeers.get(peer);
      if (remotePeer) {
        remotePeer.hangup();
        remotePeers.delete(peer);
      }
    };

    const hangupAll = () => {
      remotePeers.forEach((peer) => {
        hangup(peer.patp);
      });
      remotePeers.clear();
      localPeer?.disableMedia();
    };

    return {
      afterCreate() {},
      reset() {
        // cleanup rooms
        console.log('destroying room store');
        hangupAll();
        if (self.current) {
          RoomsIPC.leaveRoom(self.current.rid);
        }
        applySnapshot(self, {});
      },
      beforeDestroy() {
        // cleanup rooms
        console.log('destroying room store');
        hangupAll();
        if (self.current) {
          RoomsIPC.leaveRoom(self.current.rid);
        }
      },
      sendData(data: Partial<DataPacket>) {
        sendDataToPeer(data);
      },
      getPeers() {
        return self.current ? self.current.present : [];
      },
      getPeer(patp: string) {
        if (patp === window.ship) return localPeer;
        console.log('getPeer', patp, window.ship);
        return remotePeers.get(patp);
      },
      sendChat: flow(function* (message: string) {
        if (!self.current) return;
        const chatMessage = ChatModel.create({
          index: self.chat.length,
          content: message,
          author: window.ship,
          isRightAligned: true,
          timeReceived: new Date().getTime(),
        });
        self.chat.push(chatMessage);
        yield RoomsIPC.sendChat(message);
      }),
      init: flow(function* () {
        localPeer.init(
          window.ship,
          {
            setAudioAttached: self.setAudioAttached,
            setMuted: self.setMuted,
            setSpeaking: self.setSpeaking,
          },
          {
            isHost: false,
            rtc: self.rtcConfig,
          }
        );
        console.log('creating room store');
        const url = 'https://socket.holium.live';
        socket = io(url, {
          transports: ['websocket'],
          path: '/socket-io/',
          query: {
            serverId: window.ship,
          },
        });
        socket.on('connect', () => {
          console.log('connected');
        });

        socket.on('signal', (payload: any) => {
          console.log('signal', payload);
          const remotePeer = remotePeers.get(payload.from);
          const signalData = payload.data;
          if (signalData.type === 'waiting') {
            if (!remotePeer) {
              console.log(`%waiting from unknown ${payload.from}`);
              queuedPeers.push(payload.from);
            } else {
              console.log(`%waiting from ${payload.from}`);
              remotePeer.onWaiting();
            }
          }
          if (signalData.type === 'retry') {
            const retryingPeer = remotePeers.get(payload.from);
            retryingPeer?.dial();
          }
          if (!['retry', 'ack-waiting', 'waiting'].includes(signalData.type)) {
            if (remotePeer) {
              remotePeer.peerSignal(signalData);
            } else {
              console.log(`%${signalData.type} from unknown ${payload.from}`);
            }
          }
        });

        socket.on('disconnect', () => {
          console.log(socket?.id); // undefined
        });
        const session = yield RoomsIPC.getSession();
        if (session) {
          self.provider = session.provider;
          self.rooms = session.rooms;
          if (session.current) {
            self.current = self.rooms.get(session.current);
            yield localPeer.enableMedia();
            // self.current && dialAll(window.ship, self.current, self.config.rtc);
          }
        }
      }),
      // rooms actions
      createRoom: flow(function* (
        title: string,
        access: 'public' | 'private',
        spacePath?: string | null
      ) {
        if (!localPeer) return;
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
          self.rooms.set(newRoom.rid, cast(newRoom));
          self.current = self.rooms.get(newRoom.rid);
          yield localPeer.enableMedia();
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
          yield localPeer?.enableMedia();
          dialAll(room, self.rtcConfig);
          yield RoomsIPC.enterRoom(rid);
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
          SoundActions.playRoomLeave();
          yield RoomsIPC.leaveRoom(currentRid);
          hangupAll();
          localPeer.unmute();
        } catch (e) {
          console.error(e);
        }
      }),
      deleteRoom: flow(function* (rid: string) {
        const room = self.rooms.get(rid);
        if (room) {
          self.current = undefined;
          self.rooms.delete(rid);
          SoundActions.playRoomLeave();
          yield RoomsIPC.deleteRoom(rid);
          hangupAll();
        } else {
          console.error('Room not found');
        }
      }),
      // Peer handling
      retryPeer(patp: string) {
        remotePeers.get(patp)?.dial();
      },
      kickPeer: flow(function* (patp: string) {
        if (!self.current) return;
        yield RoomsIPC.kickPeer(self.current.rid, patp);
      }),
      // Local handling
      mute() {
        localPeer?.mute();
        sendDataToPeer({
          kind: DataPacketKind.MUTE_STATUS,
          value: { data: true },
        });
        self.isMuted = true;
      },
      unmute() {
        localPeer?.unmute();
        sendDataToPeer({
          kind: DataPacketKind.MUTE_STATUS,
          value: { data: false },
        });
        self.isMuted = false;
      },
      setAudioInput(deviceId: string) {
        localPeer?.setAudioInputDevice(deviceId);
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
          if (patp !== window.ship) {
            const remotePeer = dialPeer(rid, patp, self.rtcConfig);
            // queuedPeers are peers that are ready for us to dial them
            if (queuedPeers.includes(patp)) {
              remotePeer.onWaiting();
              queuedPeers.splice(queuedPeers.indexOf(patp), 1);
            }
          }
        }
      },
      _onRoomLeft(rid: string, patp: string) {
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
        if (room?.creator !== window.ship) {
          remotePeers.forEach((peer) => {
            hangup(peer.patp);
          });
          remotePeers.clear();
        }
        self.rooms.delete(rid);
      },
      _onProviderChanged(payload: {
        provider: string;
        rooms: Map<string, RoomMobx>;
      }) {
        self.provider = payload.provider;
        applySnapshot(self.rooms, cast(payload.rooms));
      },
      _onChatReceived(payload: { from: string; content: string }) {
        const chatMessage = ChatModel.create({
          index: self.chat.length,
          content: payload.content,
          author: payload.from,
          isRightAligned: false,
          timeReceived: new Date().getTime(),
        });
        self.chat.push(chatMessage);
      },
      _onSignal(payload: any) {
        const remotePeer = remotePeers.get(payload.from);
        const signalData = JSON.parse(payload.data);
        if (signalData.type === 'waiting') {
          if (!remotePeer) {
            console.log(`%waiting from unknown ${payload.from}`);
            queuedPeers.push(payload.from);
          } else {
            console.log(`%waiting from ${payload.from}`);
            remotePeer.onWaiting();
          }
        }
        if (signalData.type === 'retry') {
          const retryingPeer = remotePeers.get(payload.from);
          retryingPeer?.dial();
        }
        if (!['retry', 'ack-waiting', 'waiting'].includes(signalData.type)) {
          if (remotePeer) {
            remotePeer.peerSignal(payload.data);
          } else {
            console.log(
              `%${JSON.parse(payload.data)?.type} from unknown ${payload.from}`
            );
          }
        }
      },
    };
  });

export type RoomsMobxType = Instance<typeof RoomsStore>;

let areListenersRegistered = false;
function registerOnUpdateListener() {
  if (areListenersRegistered) return;

  RoomsIPC.onUpdate(({ mark, type, payload }) => {
    if (mark === 'rooms-v2-view') {
      if (type === 'session') {
        shipStore.roomsStore._onSession(payload);
      }
    }
    if (mark === 'rooms-v2-reaction') {
      if (type === 'room-entered') {
        SoundActions.playRoomPeerEnter();
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
      }
      if (type === 'chat-received') {
        console.log(`%chat-received`, payload);
        shipStore.roomsStore._onChatReceived(payload);
      }
      if (type === 'provider-changed') {
        shipStore.roomsStore._onProviderChanged(payload);
      }
    }
    if (mark === 'rooms-v2-signal') {
      shipStore.roomsStore._onSignal(payload);
    }
  });

  areListenersRegistered = true;
}

registerOnUpdateListener();
