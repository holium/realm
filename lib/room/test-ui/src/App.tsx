import './App.css';
import * as process from 'process';
import { RemotePeer, RoomsManager, TestProtocol } from '@holium/realm-room';
import { Speaker } from './Speaker';
import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

//
// Set the ship with
// http://localhost:3000/~dev
//
const testShip = window.location.href.split('/')[3] || '~sun';

const protocol = new TestProtocol(
  testShip,
  {
    rtc: {
      iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
    },
  },
  'http://localhost:3100'
);

export const roomsManager = new RoomsManager(protocol);

const App: FC = observer(() => {
  useEffect(() => {
    roomsManager.listRooms();

    return () => {
      roomsManager.presentRoom?.leave();
    };
  }, []);

  return (
    <div className="room-page">
      <div className="room-sidebar">
        <div className="room-sidebar-header">
          <b>Rooms</b> {testShip}
        </div>
        <div className="room-list">
          {roomsManager.rooms.map((room: any) => {
            const isPresent = roomsManager.presentRoom?.rid === room.rid;
            return (
              <div
                className={
                  isPresent ? 'room-row room-row-selected' : 'room-row'
                }
                key={room.rid}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  if (isPresent) {
                    roomsManager.leaveRoom(room.rid);
                  } else {
                    roomsManager.enterRoom(room.rid);
                  }
                }}
              >
                {room.rid}
                <div>
                  {roomsManager.presentRoom?.rid === room.rid ? 'Present' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="speaker-grid">
        {roomsManager.presentRoom && (
          <Speaker
            our
            person={roomsManager.our}
            type={roomsManager.local.host ? 'host' : 'speaker'}
          />
        )}
        {roomsManager.presentRoom &&
          roomsManager.presentRoom!.peers.map((peer: RemotePeer) => {
            return (
              <Speaker
                our={false}
                key={peer.patp}
                person={peer.patp}
                type={
                  peer.patp === roomsManager.presentRoom?.room.creator
                    ? 'host'
                    : 'speaker'
                }
              />
            );
          })}
      </div>
    </div>
  );
});

export default App;
