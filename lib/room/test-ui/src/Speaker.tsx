import { observer } from 'mobx-react';
import { RemotePeer, useRoomsManager } from '@holium/realm-room';

type ISpeaker = {
  our: boolean;
  patp: string;
  peer?: RemotePeer;
  cursors?: boolean;
  type: 'host' | 'speaker' | 'listener';
};

const SpeakerPresenter = ({ our, patp }: ISpeaker) => {
  const { roomsManager } = useRoomsManager();

  if (!roomsManager) return null;

  return (
    <div className="speaker-container">
      <p style={{ margin: 0 }}>
        <b>{patp}</b>
      </p>
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
};

export const Speaker = observer(SpeakerPresenter);
