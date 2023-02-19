import { observer } from 'mobx-react';
import { roomsManager } from './App';
import { RemotePeer } from '../../src';

type ISpeaker = {
  our: boolean;
  patp: string;
  peer?: RemotePeer;
  cursors?: boolean;
  type: 'host' | 'speaker' | 'listener';
};

const SpeakerPresenter = ({ our, patp }: ISpeaker) => (
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

export const Speaker = observer(SpeakerPresenter);
