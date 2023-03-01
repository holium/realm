import { useRoomsManager } from '@holium/realm-room';
import { Speaker } from './Speaker';

export const UI = () => {
  const { ship, roomsManager } = useRoomsManager();

  if (!roomsManager) return null;

  console.log('roomsManager.rooms', roomsManager.rooms);
  return (
    <div
      className="room-page"
      key={roomsManager.rooms.map((r) => r.rid).join('-')}
    >
      <div className="room-sidebar">
        <div className="room-sidebar-header">
          <b>Rooms</b> {ship.ship}
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
                onClick={(evt) => {
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
            <Speaker
              our
              patp={roomsManager.our}
              type={roomsManager.local.host ? 'host' : 'speaker'}
            />
          )}
          {Array.from(roomsManager.protocol.peers.keys()).map((patp) => {
            let peer = roomsManager.protocol.peers.get(patp);

            if (!peer) return null;

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
          })}
        </div>
      </div>
    </div>
  );
};
