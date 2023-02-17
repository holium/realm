import './App.css';
import * as process from 'process';
import {
  RoomsManager,
  RealmProtocol,
  RoomManagerEvent,
  RemotePeer,
} from '@holium/realm-room';
import Urbit from '@urbit/http-api';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

const ShipConfig: { [ship: string]: any } = {
  '~zod': {
    ship: 'zod',
    url: 'http://localhost',
    code: 'lidlut-tabwed-pillex-ridrup',
  },
  '~dev': {
    ship: 'dev',
    url: 'http://localhost:8081',
    code: 'magsub-micsev-bacmug-moldex',
  },
  '~fes': {
    ship: 'fes',
    url: 'http://localhost:8080',
    code: 'lagfep-borweb-sabler-dacnus',
  },
  '~sun': {
    ship: 'sun',
    url: 'http://localhost:8087',
    code: 'parsyr-dibwyt-livpen-hatsym',
  },
  '~bus': {
    ship: 'bus',
    url: 'http://localhost:8080',
    code: 'riddec-bicrym-ridlev-pocsef',
  },
};

const testShip = window.location.href.split('/')[3] || '~fes';
const shipData = ShipConfig[testShip];
// NOTE: to connect one ship to another, you must manually poke the ship to `set-provider` like:
// :rooms-v2 &rooms-v2-session-action [%set-provider ~dev]
//  (^ on the dojo of ~fes if he wanted to connect to a room hosted by ~dev)

export let roomsManager: RoomsManager;

const AppPresenter = () => {
  const [roomsApi, setRoomsManager] = useState<RoomsManager | null>(null);
  useEffect(() => {
    let api: any = null;
    if (!roomsApi) {
      Urbit.authenticate(shipData).then(async (newApi) => {
        api = newApi;
        await api.connect();
        const handlers = {
          poke: api.poke.bind(api),
          scry: api.scry.bind(api),
        };

        const protocol = new RealmProtocol(
          testShip,
          {
            rtc: {
              iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
            },
          },
          handlers
        );
        roomsManager = new RoomsManager(protocol);
        setRoomsManager(roomsManager);
        api.subscribe({
          app: 'rooms-v2',
          path: '/lib',
          event: (data: any, mark: any) => {
            (roomsManager.protocol as RealmProtocol).onSignal(data, mark);
          },
        });
        roomsManager.on(
          RoomManagerEvent.OnDataChannel,
          (_rid: string, _peer: string, data: any) => {
            console.log('peer data', data);
          }
        );
      });
    }

    return () => {
      api?.delete();
    };
  }, [roomsApi === null]);

  if (!roomsApi) return null;

  return (
    <div className="room-page">
      <div className="room-sidebar">
        <div className="room-sidebar-header">
          <b>Rooms</b> {testShip}
        </div>
        <div className="room-list">
          {roomsManager.rooms.map((room: any) => {
            const isPresent = roomsManager.live.room?.rid === room.rid;
            return (
              <div
                className={
                  isPresent ? 'room-row room-row-selected' : 'room-row'
                }
                key={room.rid}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  if (isPresent) {
                    roomsManager.leaveRoom();
                  } else {
                    roomsManager.enterRoom(room.rid);
                  }
                }}
              >
                {room.rid}
                <div>
                  {roomsManager.live.room?.rid === room.rid ? 'Present' : ''}
                </div>
              </div>
            );
          })}
        </div>
        <div className="room-sidebar-footer">
          <button
            onClick={() =>
              roomsManager.createRoom(
                'TESTING NEW BUILD DONT JOIN',
                'public',
                '/~lomder-librun/realm-forerunners'
              )
            }
          >
            Create Room
          </button>
        </div>
      </div>

      <div className="room-pane">
        <div className="room-control-bar">
          <button
            onClick={() =>
              roomsManager.sendData({
                kind: 0,
                value: {
                  app: 'rooms',
                  data: {
                    test: 'test',
                  },
                },
              })
            }
          >
            Send data to room
          </button>
        </div>
        <div className="speaker-grid">
          {roomsManager.live.room && (
            <OurMic
              our
              patp={roomsManager.our}
              type={roomsManager.local.host ? 'host' : 'speaker'}
            />
          )}
          {[...Array.from(roomsManager.protocol.peers.keys())].map(
            (patp: any) => {
              let peer: any;

              peer = roomsManager.protocol.peers.get(patp);
              if (!peer) {
                return null;
              }

              return (
                <div key={patp} className="speaker-container">
                  <p style={{ margin: 0 }}>{patp}</p>
                  <p
                    style={{
                      marginTop: 6,
                      marginBottom: 12,
                      opacity: 0.5,
                      fontSize: 12,
                    }}
                  >
                    {peer?.patpId}
                  </p>
                  <div
                    style={{ display: 'flex', gap: 8, flexDirection: 'row' }}
                  ></div>

                  <div>
                    <p>Status: {peer.status}</p>
                    <p>Audio streaming: {peer.isAudioAttached.toString()}</p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

type ISpeaker = {
  our: boolean;
  patp: string;
  peer?: RemotePeer;
  cursors?: boolean;
  type: 'host' | 'speaker' | 'listener';
};

const OurMicPresenter = ({ our, patp }: ISpeaker) => (
  <div className="speaker-container">
    <p style={{ margin: 0 }}>{patp}</p>
    <p style={{ marginTop: 6, marginBottom: 12, opacity: 0.5, fontSize: 12 }}>
      {our}
    </p>
    <div style={{ display: 'flex', gap: 8, flexDirection: 'row' }}>
      <button
        onClick={() => {
          if (our) {
            if (roomsManager.muteStatus) {
              roomsManager.unmute();
            } else {
              roomsManager.mute();
            }
          }
        }}
      >
        {our ? (roomsManager.muteStatus ? 'Unmute' : 'Mute') : 'Mute'}
      </button>
    </div>

    <div>
      <p>Microphone: {'activated'}</p>
    </div>
  </div>
);

const OurMic = observer(OurMicPresenter);

export const App = observer(AppPresenter);
