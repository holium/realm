import { observer } from 'mobx-react';
import { DataPacket_Kind, RemotePeer } from '@holium/realm-room';
import { Speaker } from './Speaker';
import { useRoomsManager } from './components/RoomsManagerProvider';

const UIPresenter = () => {
  const { ship, roomsManager } = useRoomsManager();

  if (!roomsManager) return null;

  const rooms = roomsManager.rooms;
  const peers = Array.from(roomsManager.protocol.peers.keys())
    .map((patp) => roomsManager.protocol.peers.get(patp))
    .filter(Boolean) as RemotePeer[];

  const onClickCreateRoom = () => {
    roomsManager.createRoom(
      'TESTING NEW BUILD DONT JOIN',
      'public',
      '/~lomder-librun/realm-forerunners'
    );
  };

  const onClickSendDataToRoom = () => {
    roomsManager.sendData({
      kind: DataPacket_Kind.DATA,
      value: {
        app: 'rooms',
        data: {
          test: 'test',
        },
      },
    });
  };

  return (
    <div className="room-page">
      <div className="room-sidebar">
        <div className="room-sidebar-header">
          <b>Rooms</b> {ship.ship}
        </div>
        <div className="room-list">
          {rooms.map((room) => {
            const isPresent = roomsManager.live.room?.rid === room.rid;
            return (
              <div
                className={`room-row ${isPresent && 'room-row-selected'}`}
                key={room.rid}
                onClick={(evt) => {
                  evt.stopPropagation();
                  if (isPresent) {
                    roomsManager.leaveRoom();
                  } else {
                    roomsManager.joinRoom(room.rid);
                  }
                }}
              >
                {room.rid}
              </div>
            );
          })}
        </div>
        <div className="room-sidebar-footer">
          <button onClick={onClickCreateRoom}>Create Room</button>
        </div>
      </div>

      <div className="room-pane">
        <div className="room-control-bar">
          <button onClick={onClickSendDataToRoom}>Send data to room</button>
        </div>
        <div className="speaker-grid">
          {roomsManager.live.room && (
            <Speaker
              our
              patp={roomsManager.our}
              type={roomsManager.local.host ? 'host' : 'speaker'}
            />
          )}
          {peers.map((peer) => (
            <div key={peer.patp} className="speaker-container">
              <p style={{ margin: 0 }}>
                <b>{peer.patp}</b>
              </p>

              <div>
                <p>Status: {peer.status}</p>
                <p>Audio streaming: {peer.isAudioAttached.toString()}</p>
                <p>Muted: {peer.isMuted.toString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UI = observer(UIPresenter);
