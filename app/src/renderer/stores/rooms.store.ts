import { observable } from 'mobx';
import { applySnapshot, cast, flow, Instance, types } from 'mobx-state-tree';
import Peer, { Instance as PeerInstance } from 'simple-peer';
import { patp2dec } from 'urbit-ob';

import { SoundActions } from 'renderer/lib/sound';

import { RoomsIPC } from './ipc';
import { LocalPeer } from './rooms/LocalPeer';
import { ridFromTitle } from './rooms/rooms.parsing';
import {
  DataPacket,
  DataPacketKind,
  PeerConnectionState,
} from './rooms/rooms.types';

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
    path: types.maybeNull(types.string),
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
          urls: ['turn:coturn.holium.live:3478'],
        },
        {
          urls: ['stun:coturn.holium.live:3478'],
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
    get peers() {
      return self.current?.present.filter((patp) => patp !== window.ship);
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
    setRoomsFromArr: (rooms: any) => {
      applySnapshot(
        self.rooms,
        rooms.reduce((acc: any, room: any) => {
          acc[room.rid] = room;
          return acc;
        }, {})
      );
    },
    addRoom: (room: any) => {
      self.rooms.set(room.rid, room);
    },
    updateRoom: (room: any) => {
      self.rooms.set(room.rid, room);
    },
    setRooms: (rooms: any) => {
      self.rooms = rooms;
    },
    setCurrent: (room: any) => {
      self.current = room;
    },
    removeRoom: (rid: string) => {
      self.rooms.delete(rid);
    },
  }))
  .actions((self) => {
    // let socket: undefined | Socket<any, any>;
    const localPeer = observable(new LocalPeer());
    const remotePeers = observable(new Map<string, PeerInstance>());
    // const queuedPeers = observable([]) as string[]; // peers that we have queued to dial

    const onPeerSignal = (from: string, data: any) => {
      try {
        const peer = remotePeers.get(from);
        if (peer) {
          peer.signal(data);
          return;
        }
      } catch (e) {
        console.error('sigal error', e);
      }
    };

    const createPeer = (
      peerId: string,
      initiator: boolean,
      stream: MediaStream
    ) => {
      console.log('createPeer', peerId, initiator, stream);

      const peer = new Peer({
        initiator: initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [
            {
              username: 'realm',
              credential: 'zQzjNHC34Y8RqdLW',
              urls: ['turn:coturn.holium.live:3478'],
            },
            {
              urls: ['stun:coturn.holium.live:3478'],
            },
          ],
        },
      });

      peer.on('signal', (signal) => {
        if (!self.current) return;

        const msg = {
          type: 'signal',
          rid: self.current.rid,
          signal,
          to: peerId,
          from: window.ship,
        };
        websocket.send(serialize(msg));
      });

      peer.on('stream', (stream) => {
        console.log('Got peer stream!!!', peerId, stream);
        peer.addStream(stream);
        // create an audio element for the stream
        // const audio = document.createElement('audio');
        // audio.id = `peer-audio-${peerId}`;
        // audio.srcObject = stream;
        // audio.autoplay = true;
        // audio.playsInline = true;
        // document.getElementById(`peer-video-${peerId}`).srcObject = stream

        // document.getElementById(`peer-video-${peerId}`).srcObject = stream;
        // setPeerState(peerId, peer);
      });

      peer.on('connect', () => {
        console.log('Connected to peer', peerId);
        // setPeerState(peerId, peer);
        peer.send(
          serialize({
            type: 'peer-message',
            msg: 'hey man!',
          })
        );
      });

      peer.on('data', (data) => {
        console.log('Data from peer', peerId, unserialize(data));
      });

      peer.on('error', (e) => {
        console.log('Peer error %s:', peerId, e);
      });

      // setPeerState(peerId, peer);
      remotePeers.set(peerId, peer);

      return peer;
    };

    const destroyPeer = (peerId: string) => {
      remotePeers.get(peerId)?.destroy();
      remotePeers.delete(peerId);
    };

    const isInitiatorCheck = (from: string, to: string) => {
      return patp2dec(from) > patp2dec(to);
    };

    const responseParser = (response: any) => {
      switch (response.type) {
        case 'rooms':
          applySnapshot(
            self.rooms,
            response.rooms.reduce((acc: any, room: any) => {
              acc[room.rid] = room;
              return acc;
            }, {})
          );

          break;
        case 'room-created':
          console.log('room created', response.room);
          self.addRoom(response.room);
          self.setCurrent(self.rooms.get(response.room.rid));
          break;
        case 'room-entered':
          console.log('room entered', response);
          self.updateRoom(response.room);
          if (response.room.rid === self.current?.rid) {
            // if we entered a room, we need to create a peer for each user in the room
            const peers = response.room.present.filter(
              (peer: string) => peer !== window.ship
            );

            peers.forEach((peerId: string) => {
              if (!localPeer.stream) {
                console.error('no local stream');
                return;
              }
              if (remotePeers.get(peerId)) {
                console.log('already have peer', peerId);
                return;
              }
              const peer = createPeer(
                peerId,
                isInitiatorCheck(window.ship, peerId),
                localPeer.stream
              );
              remotePeers.set(peerId, peer);
            });
          }
          break;
        case 'room-left':
          // replace room in rooms array with response.room
          const room = response.room;
          self.updateRoom(response.room);
          if (self.current?.rid === room.rid) {
            if (response.peer_id === window.ship) {
              self.setCurrent(undefined);
            } else {
              // someone left the room
              console.log('someone left the room', response);
              destroyPeer(response.peer_id);
              self.rooms.get(response.rid)?.present.remove(response.peer_id);

              // self.rooms = self.rooms.map((room: any) =>
              //   room.rid === response.rid ? updatedRoom : room
              // );
              self.setCurrent(self.rooms.get(response.rid));
            }
          }
          break;
        case 'room-deleted':
          const removeRid = response.rid;
          self.removeRoom(removeRid);
          if (self.current?.rid === removeRid) {
            self.current?.present.forEach((peerId) => {
              if (peerId !== window.ship) destroyPeer(peerId);
            });
            self.setCurrent(undefined);
          }
          break;
        case 'signal':
          const { signal, from, rid } = response;
          if (self.current && self.current.present.includes(from)) {
            if (!localPeer.stream) {
              console.error('no local stream');
              return;
            }
            const peer =
              remotePeers.get(from) ||
              createPeer(
                rid,
                isInitiatorCheck(window.ship, from),
                localPeer.stream
              );

            remotePeers.set(from, peer);
            onPeerSignal(from, signal);
          }
          break;
      }
    };
    const serialize = (data: any) => {
      return JSON.stringify(data);
    };

    const unserialize = (data: string) => {
      try {
        return JSON.parse(data.toString());
      } catch (e) {
        return undefined;
      }
    };

    console.log(`wss://node-0.holium.live/signaling?serverId=${window.ship}`);

    const websocket = new WebSocket(
      // `wss://node-0.holium.live/signaling?serverId=${window.ship}`
      `wss://node-0.holium.live/signaling?serverId=~lomder-librun`
    );

    websocket.onopen = function open() {
      // setStatus('connected');
      console.log('connected');
      websocket.send(serialize({ type: 'connect' }));
    };

    websocket.onmessage = function incoming(message) {
      const parsedMessage = unserialize(message.data);
      responseParser(parsedMessage);
    };

    websocket.onclose = function close() {
      console.log('disconnected');
      // setStatus('disconnected');
      // setTimeout(connect, 5000); // Try to reconnect after 5 seconds
    };

    websocket.onerror = function error(err) {
      console.error('Error occurred:', err);
      // setStatus('error');
      websocket.close();
    };

    const disconnect = () => {
      websocket.send(serialize({ type: 'disconnect' }));
      websocket.close();
    };
    // on sigkill close the connection
    window.onbeforeunload = function () {
      disconnect();
    };

    const sendDataToPeer = (data: Partial<DataPacket>) => {
      const payload = { from: localPeer?.patp, ...data } as DataPacket;
      remotePeers.forEach((peer) => {
        peer.send(serialize(payload));
      });
    };

    // const sendSignal = (to: string, rid: string, signal: any) => {
    //   websocket.send(
    //     serialize({ type: 'signal', from: window.ship, to, rid, data: signal })
    //   );
    // };

    // const dialAll = (room: RoomMobx, rtc: RTCConfiguration) => {
    //   const presentPeers = room.present.filter(
    //     (peer: string) => window.ship !== peer
    //   );
    //   presentPeers.forEach((peer: string) => {
    //     dialPeer(room.rid, peer, rtc);
    //   });
    // };

    const hangup = (peer: string) => {
      const remotePeer = remotePeers.get(peer);
      // console.log('hanging up', remotePeer?.patp);
      if (remotePeer) {
        remotePeer.destroy();
        remotePeers.delete(peer);
      }
    };

    const hangupAll = () => {
      Array.from(remotePeers.entries()).forEach(([peer, _]: [string, any]) => {
        hangup(peer);
      });
      remotePeers.clear();
      localPeer.disableMedia();
    };

    return {
      afterCreate() {},
      reset() {
        hangupAll();
        if (self.current) {
          RoomsIPC.leaveRoom(self.current.rid);
        }
        applySnapshot(self, {});
      },
      beforeDestroy() {
        // cleanup rooms
        // console.log('destroying room store');
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
        return remotePeers.get(patp);
      },
      setProvider: flow(function* (provider: string) {
        if (self.provider !== provider) {
          if (self.current) {
            // console.log('switching provider, leaving room', self.current?.rid);
            yield RoomsIPC.leaveRoom(self.current?.rid);
            self.current.removePeer(window.ship);
            hangupAll();
            self.current = undefined;
            SoundActions.playRoomLeave();
          }
          self.provider = provider;
          // const session = yield RoomsIPC.getSession();
          // if (session) {
          //   console.log('setting provider', provider);

          // }
        }
        yield RoomsIPC.setProvider(provider);
      }),
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
      init() {
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

        // const session = yield RoomsIPC.getSession();
        // if (session) {
        //   self.provider = session.provider;
        //   self.rooms = session.rooms;
        //   if (session.current) {
        //     self.current = self.rooms.get(session.current);
        //     yield localPeer.enableMedia();
        //     // self.current && dialAll(window.ship, self.current, self.config.rtc);
        //   }
        // }
      },
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
          websocket?.send(
            serialize({
              type: 'create-room',
              rid: newRoom.rid,
              title: newRoom.title,
              access: newRoom.access,
              path: newRoom.path,
            })
          );
          yield localPeer.enableMedia();
          // yield RoomsIPC.createRoom(
          //   newRoom.rid,
          //   newRoom.title,
          //   newRoom.access as 'public' | 'private',
          //   newRoom.path
          // );
        } catch (e) {
          console.error(e);
        }
      }),
      joinRoom: flow(function* (rid: string) {
        const room = self.rooms.get(rid);
        if (room) {
          SoundActions.playRoomEnter();
          self.current = room;
          websocket?.send(
            serialize({
              type: 'enter-room',
              rid,
            })
          );
          yield localPeer?.enableMedia();
          // dialAll(room, self.rtcConfig);
          // yield RoomsIPC.enterRoom(rid);
        } else {
          console.error('Room not found');
        }
      }),
      leaveRoom() {
        if (!self.current) return;
        try {
          const currentRid = self.current.rid;
          self.current.removePeer(window.ship);
          self.current = undefined;
          SoundActions.playRoomLeave();
          websocket?.send(
            serialize({
              type: 'leave-room',
              rid: currentRid,
            })
          );
          // yield RoomsIPC.leaveRoom(currentRid);
          // hangupAll();
          localPeer.unmute();
        } catch (e) {
          console.error(e);
        }
      },
      deleteRoom(rid: string) {
        const room = self.rooms.get(rid);
        if (room) {
          self.current = undefined;
          self.rooms.delete(rid);
          SoundActions.playRoomLeave();
          // yield RoomsIPC.deleteRoom(rid);
          websocket?.send(
            serialize({
              type: 'delete-room',
              rid,
            })
          );
          hangupAll();
        } else {
          console.error('Room not found');
        }
      },
      // Peer handling
      retryPeer(_patp: string) {
        // remotePeers.get(patp)?.dial();
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
    };
  });

export type RoomsMobxType = Instance<typeof RoomsStore>;

// let areListenersRegistered = false;
// function registerOnUpdateListener() {
//   if (areListenersRegistered) return;

//   RoomsIPC.onUpdate(({ mark, type, payload }) => {
//     if (mark === 'rooms-v2-view') {
//       if (type === 'session') {
//         shipStore.roomsStore._onSession(payload);
//       }
//     }
//     if (mark === 'rooms-v2-reaction') {
//       if (type === 'room-entered') {
//         shipStore.roomsStore._onRoomEntered(payload.rid, payload.ship);
//       }
//       if (type === 'room-left') {
//         shipStore.roomsStore._onRoomLeft(payload.rid, payload.ship);
//       }
//       if (type === 'room-created') {
//         shipStore.roomsStore._onRoomCreated(payload.room);
//       }
//       if (type === 'room-deleted') {
//         shipStore.roomsStore._onRoomDeleted(payload.rid);
//       }
//       if (type === 'kicked') {
//         shipStore.roomsStore._onKicked(payload.rid, payload.ship);
//       }
//       if (type === 'chat-received') {
//         // console.log(`%chat-received`, payload);
//         shipStore.roomsStore._onChatReceived(payload);
//       }
//       if (type === 'provider-changed') {
//         shipStore.roomsStore._onProviderChanged(payload);
//       }
//     }
//     if (mark === 'rooms-v2-signal') {
//       shipStore.roomsStore._onSignal(payload);
//     }
//   });

//   areListenersRegistered = true;
// }

// registerOnUpdateListener();
