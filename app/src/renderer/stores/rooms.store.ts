import { observable } from 'mobx';
import { applySnapshot, cast, flow, Instance, types } from 'mobx-state-tree';
import { patp2dec } from 'urbit-ob';

import { DataPacket_Kind } from '@holium/realm-room';

import { SoundActions } from 'renderer/lib/sound';

import { appState } from './app.store';
import { RoomsIPC } from './ipc';
import { Chat } from './models/chat.model';
import { LocalPeer } from './rooms/LocalPeer';
import { RemotePeer } from './rooms/RemotePeer';
import { ridFromTitle } from './rooms/rooms.parsing';
import { DataPacket, PeerConnectionState } from './rooms/rooms.types';
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
    our: types.maybe(types.string),
    rooms: types.map(RoomModel),
    chat: types.maybe(Chat),
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
  .actions((self) => {
    const localPeer = observable(new LocalPeer());
    const remotePeers = observable(new Map<string, RemotePeer>());
    const queuedPeers = observable([]) as string[]; // peers that we have queued to dial

    const sendDataToPeer = (data: Partial<DataPacket>) => {
      const payload = { from: localPeer?.patp, ...data } as DataPacket;
      remotePeers.forEach((peer) => {
        console.log('sendDataToPeer ....', peer.patp, peer.status);
        if (peer.status === PeerConnectionState.Connected) {
          peer.sendData(payload);
        }
      });
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
        {
          setAudioAttached: (isAttached: boolean) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            const currentMtd = self.peersMetadata.get(to);
            currentMtd?.setAudioAttached(isAttached);
          },
          setMuted: (isMuted: boolean) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            const currentMtd = self.peersMetadata.get(to);
            currentMtd?.setMute(isMuted);
          },
          setSpeaking: (isSpeaking: boolean) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            const currentMtd = self.peersMetadata.get(to);
            currentMtd?.setSpeaking(isSpeaking);
          },
          setStatus: (status: PeerConnectionState) => {
            if (!self.peersMetadata.has(to)) {
              self.peersMetadata.set(to, PeerMetadata.create());
            }
            const currentMtd = self.peersMetadata.get(to);
            currentMtd?.setStatus(status);
          },
        },
        peerConfig
      );

      remotePeers.set(remotePeer.patp, remotePeer);
      remotePeer.dial();
      return remotePeer;
    };
    const dialAll = (room: RoomMobx, rtc: RTCConfiguration) => {
      const presentPeers = room.present.filter(
        (peer: string) => self.our !== peer
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
      console.log('hangupAll', remotePeers);
      localPeer?.disableMedia();
    };

    return {
      beforeDestroy() {
        // cleanup rooms
        hangupAll();
        if (self.current) {
          RoomsIPC.leaveRoom(self.current.rid);
        }
      },
      getPeers() {
        return self.current ? self.current.present : [];
      },
      getPeer(patp: string) {
        if (patp === self.our) return localPeer;
        console.log('getPeer', patp, self.our);
        return remotePeers.get(patp);
      },
      init: flow(function* () {
        if (!appState.loggedInAccount)
          throw new Error('No logged in ship for rooms store');
        self.our = appState.loggedInAccount.patp;
        self.chat = Chat.create({
          path: 'roomschat',
          type: 'group',
          host: self.our,
          muted: false,
          pinned: false,
          peersGetBacklog: true,
          invites: 'host',
          metadata: {
            title: '',
            creator: self.our,
            timestamp: Date.now(),
          },
        });
        localPeer.init(
          self.our,
          {
            setAudioAttached: (isAttached: boolean) => {
              self.isAudioAttached = isAttached;
            },
            setMuted: (isMuted: boolean) => {
              console.log('afterCreate setMuted', isMuted);
              self.isMuted = isMuted;
            },
            setSpeaking: (isSpeaking: boolean) => {
              self.isSpeaking = isSpeaking;
            },
          },
          {
            isHost: false,
            rtc: self.rtcConfig,
          }
        );
        const session = yield RoomsIPC.getSession();
        if (session) {
          self.provider = session.provider;
          self.rooms = session.rooms;
          const current = Array.from(self.rooms.values()).find(
            (r) => r.creator === self.our
          );
          if (current) {
            self.current = current;
            yield localPeer.enableMedia();
          }
        }
      }),
      createRoom: flow(function* (
        title: string,
        access: 'public' | 'private',
        spacePath?: string | null
      ) {
        if (!localPeer) return;
        if (!self.our) return;
        try {
          const newRoom = RoomModel.create({
            rid: ridFromTitle(self.provider, self.our, title),
            title,
            access,
            provider: self.provider,
            creator: self.our,
            present: [self.our],
            whitelist: [],
            capacity: 6,
            path: spacePath || '',
          });
          SoundActions.playRoomEnter();
          localPeer.enableMedia();
          self.rooms.set(newRoom.rid, cast(newRoom));
          if (self.current) {
            if (self.current.creator === self.our) {
              //@ts-expect-error
              self.deleteRoom(self.current.rid);
            } else {
              //@ts-expect-error
              self.leaveRoom(self.current.rid);
            }
          }
          self.current = self.rooms.get(newRoom.rid);
          self.chat = Chat.create({
            path: 'roomschat',
            type: 'group',
            host: self.our,
            muted: false,
            pinned: false,
            peersGetBacklog: true,
            invites: 'host',
            metadata: {
              title: '',
              creator: self.our,
              timestamp: Date.now(),
            },
          });
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
          dialAll(room, self.rtcConfig);
          yield localPeer?.enableMedia();
          yield RoomsIPC.enterRoom(rid);
        } else {
          console.error('Room not found');
        }
      }),
      leaveRoom: flow(function* () {
        if (!self.current) return;
        if (!self.our) return;
        try {
          const currentRid = self.current.rid;
          self.current.removePeer(self.our);
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
          kind: DataPacket_Kind.MUTE_STATUS,
          value: { data: true },
        });
        self.isMuted = true;
      },
      unmute() {
        localPeer?.unmute();
        sendDataToPeer({
          kind: DataPacket_Kind.MUTE_STATUS,
          value: { data: false },
        });
        self.isMuted = false;
      },
      setAudioInput(deviceId: string) {
        localPeer?.setAudioInputDevice(deviceId);
      },
      sendMessage(path: string, measuredFrags: any) {
        // sendDataToPeer({ [path]: measuredFrags });
        sendDataToPeer({
          kind: DataPacket_Kind.CHAT,
          value: { [path]: measuredFrags },
        });
      },
      _onSession(session: any) {
        self.provider = session.provider;
        self.rooms = session.rooms;
        const current = Array.from(self.rooms.values()).find(
          (r) => r.creator === self.our
        );
        if (current) {
          self.current = current;
        }
      },
      _onRoomCreated(room: RoomMobx) {
        self.rooms.set(room.rid, cast(room));
      },
      _onRoomEntered(rid: string, patp: string) {
        const room = self.rooms.get(rid);
        if (patp === self.our && self.current?.rid !== rid) {
          self.current = room;
        }
        room?.addPeer(patp);
        if (self.current?.rid === rid) {
          // if we are in the room, dial the new peer
          if (remotePeers.has(patp)) {
            console.log('!!!!!already have peer', patp);
          }
          if (patp !== self.our) {
            const remotePeer = dialPeer(rid, patp, self.rtcConfig);
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
        if (patp === self.our && self.current?.rid === rid) {
          self.current = undefined;
          hangupAll();
        }
        if (patp !== self.our) {
          room?.removePeer(patp);
          hangup(patp);
        }
      },
      _onKicked(rid: string, patp: string) {
        const room = self.rooms.get(rid);
        if (patp === self.our && self.current?.rid === rid) {
          self.current = undefined;
          hangupAll();
        }
        if (patp !== self.our) {
          room?.removePeer(patp);
          hangup(patp);
        }
      },
      _onRoomDeleted(rid: string) {
        if (self.current?.rid === rid) {
          self.current = undefined;
        }
        const room = self.rooms.get(rid);
        console.log('_onRoomDeleted', room?.creator, self.our);
        if (room?.creator !== self.our) {
          // console.log('_onRoomDeleted someone else deleted');
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
            console.log(
              `%${JSON.parse(payload.data)?.type} from ${payload.from}`
            );
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
    console.log('rooms-update', type);
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
