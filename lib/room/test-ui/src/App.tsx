import './App.css';
import * as process from 'process';
import {
  RoomsManager,
  RealmProtocol,
  RoomManagerEvent,
} from '@holium/realm-room';
import Urbit from '@urbit/http-api';
import { Speaker } from './Speaker';
import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';

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
    url: 'http://localhost:8083',
    code: 'lagfep-borweb-sabler-dacnus',
  },
  '~sun': {
    ship: 'sun',
    url: 'http://localhost:8087',
    code: 'parsyr-dibwyt-livpen-hatsym',
  },
  '~lomder-librun': {
    ship: 'lomder-librun',
    url: 'http://localhost:8091',
    code: 'wistev-bacnul-fasleb-lattyn',
  },
  '~timluc-miptev': {
    ship: 'timluc-miptev',
    url: 'http://localhost:8092',
    code: 'tanlun-datber-silwyn-lonnyd',
  },
  '~novdus-fidlys-dozzod-hostyv': {
    ship: 'novdus-fidlys-dozzod-hostyv',
    url: 'http://localhost:8089',
    code: 'danmyl-natsyl-sigryc-naczod',
  },
  '~timmyr-locrul-dozzod-hostyv': {
    ship: 'timmyr-locrul-dozzod-hostyv',
    url: 'http://localhost:8090',
    code: 'timtux-sovryx-ramnys-labpet',
  },
};
const testShip = window.location.href.split('/')[3] || '~fes';
const shipData = ShipConfig[testShip];
export let roomsManager: RoomsManager;

const App: FC = observer(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [roomsApi, setRoomsManager] = useState<RoomsManager | null>(null);
  useEffect(() => {
    let api: any;
    if (!roomsApi) {
      Urbit.authenticate(shipData).then(async (newApi) => {
        api = newApi;
        console.log('connected');
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
          (rid: string, peer: string, data: any) => {
            console.log('peer data', data);
          }
        );
      });
    }

    return () => {
      api?.delete();
    };
  }, [roomsApi]);

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
            onClick={() => roomsManager.createRoom('new room', 'public', null)}
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
            <Speaker
              our
              patp={roomsManager.our}
              type={roomsManager.local.host ? 'host' : 'speaker'}
            />
          )}
          <PeerGrid />
        </div>
      </div>
    </div>
  );
});

const PeerGrid: FC = observer(() => {
  console.log(toJS(roomsManager.live));
  // if (!roomsManager.presentRoom) {
  //   return null;
  // }
  // console.log(toJS(roomsManager.presentRoom));
  return (
    <>
      {roomsManager.live.room?.present.map((patp: any) => {
        return (
          <Speaker
            our={false}
            key={patp}
            patp={patp}
            type={
              patp === roomsManager?.live.room?.creator ? 'host' : 'speaker'
            }
          />
        );
      })}
    </>
  );
});

export default App;
